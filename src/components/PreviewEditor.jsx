// src/components/PreviewEditor.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import SelectionToolbar from './SelectionToolbar';
import agentAPI from '../services/agentAPI';

export default function PreviewEditor({ content, onUpdate, onTextSelection, selectedText, selectionRange, isLoading }) {
  const [text, setText] = useState(content || '');
  const [selection, setSelection] = useState({ start: 0, end: 0, text: '' });
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef(null);

  // 当外部content变化时更新内部状态
  useEffect(() => {
    setText(content || '');
  }, [content]);

  // 使用 useCallback 来避免无限循环
  const handleTextChange = useCallback((newText) => {
    setText(newText);
    onUpdate(newText);
  }, [onUpdate]);

  // 处理文本选择
  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    console.log('Text selection:', { start, end, selectedText, hasSelection: selectedText.trim() && start !== end });

    if (selectedText.trim() && start !== end) {
      setSelection({ start, end, text: selectedText });
      
      // 计算工具栏位置 - 基于 textarea 的选择位置
      const rect = textarea.getBoundingClientRect();
      
      // 获取 textarea 的样式信息
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight) || 20;
      const fontSize = parseInt(computedStyle.fontSize) || 14;
      const paddingTop = parseInt(computedStyle.paddingTop) || 16;
      const paddingLeft = parseInt(computedStyle.paddingLeft) || 16;
      
      // 计算选中文本的行和列位置
      const textBeforeSelection = text.substring(0, start);
      const lines = textBeforeSelection.split('\n');
      const currentLine = lines.length - 1;
      const currentColumn = lines[lines.length - 1].length;
      
      // 估算字符宽度（等宽字体）
      const charWidth = fontSize * 0.6; // 大约 0.6 倍字体大小
      
      // 计算选中文本的位置
      const selectionX = rect.left + paddingLeft + (currentColumn * charWidth);
      const selectionY = rect.top + paddingTop + (currentLine * lineHeight);
      
      // 计算工具栏位置
      const toolbarWidth = 240;
      const toolbarHeight = 40;
      
      let x = selectionX - (toolbarWidth / 2); // 居中显示
      let y = selectionY - toolbarHeight - 10; // 在选中文本上方
      
      // 确保工具栏在 textarea 范围内
      if (x < rect.left + 10) {
        x = rect.left + 10;
      } else if (x + toolbarWidth > rect.right - 10) {
        x = rect.right - toolbarWidth - 10;
      }
      
      // 垂直位置调整
      if (y < rect.top + 10) {
        // 如果上方空间不够，显示在下方
        y = selectionY + lineHeight + 10;
      } else if (y + toolbarHeight > rect.bottom - 10) {
        // 如果下方空间也不够，显示在中间
        y = rect.top + (rect.height / 2) - (toolbarHeight / 2);
      }
      
      console.log('Toolbar position:', { 
        x, y, 
        selection: { x: selectionX, y: selectionY, line: currentLine, column: currentColumn },
        textareaRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      });
      
      setToolbarPosition({ x, y });
      setShowToolbar(true);
      
      // 告诉父组件
      onTextSelection && onTextSelection(selectedText, { start, end });
    } else {
      setShowToolbar(false);
      setSelection({ start: 0, end: 0, text: '' });
    }
  };

  // 鼠标抬起事件
  const handleMouseUp = () => {
    // 增加延迟确保选择完成
    setTimeout(handleTextSelection, 50);
  };

  // 处理键盘事件
  const handleKeyUp = (e) => {
    // 监听更多键盘组合
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
      setTimeout(handleTextSelection, 10);
    }
  };

  // 处理键盘按下事件
  const handleKeyDown = (e) => {
    // Ctrl+A 全选
    if (e.ctrlKey && e.key === 'a') {
      setTimeout(handleTextSelection, 10);
    }
  };

  // 隐藏工具栏
  const hideToolbar = () => {
    setShowToolbar(false);
    setSelection({ start: 0, end: 0, text: '' });
  };

  // 添加全局点击事件监听
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // 如果点击的不是 textarea 或其子元素，则隐藏工具栏
      if (textareaRef.current && !textareaRef.current.contains(e.target)) {
        hideToolbar();
      }
    };

    if (showToolbar) {
      document.addEventListener('click', handleGlobalClick);
      return () => document.removeEventListener('click', handleGlobalClick);
    }
  }, [showToolbar]);

  // AI优化
  const handleOptimize = async () => {
    if (!selection.text.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await agentAPI.rewriteText(selection.text);
      
      // 替换选中的文本
      const newText = text.substring(0, selection.start) + result.rewritten_text + text.substring(selection.end);
      handleTextChange(newText);
      hideToolbar();
    } catch (error) {
      console.error('优化失败:', error);
      alert('优化失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理AI扩写
  const handleExpand = async () => {
    if (!selection.text.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await agentAPI.expandText(selection.text);
      
      // 替换选中的文本
      const newText = text.substring(0, selection.start) + result.expanded_text + text.substring(selection.end);
      handleTextChange(newText);
      hideToolbar();
    } catch (error) {
      console.error('扩写失败:', error);
      alert('扩写失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理AI缩写
  const handleContract = async () => {
    if (!selection.text.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await agentAPI.contractText(selection.text);
      
      // 替换选中的文本
      const newText = text.substring(0, selection.start) + result.contracted_text + text.substring(selection.end);
      handleTextChange(newText);
      hideToolbar();
    } catch (error) {
      console.error('缩写失败:', error);
      alert('缩写失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* 加载覆盖层 */}
      {(isLoading || isProcessing) && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-40">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm">
              {isProcessing ? '处理中...' : '加载中...'}
            </span>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        onSelect={handleTextSelection}
        onKeyDown={handleKeyDown}
        className="flex-1 p-4 border-none resize-none outline-none text-sm leading-relaxed font-mono bg-gray-50 overflow-y-auto"
        placeholder="在这里编辑 Markdown...&#10;&#10;示例：&#10;# 姓名&#10;## 联系方式&#10;- 电话：123-456-7890&#10;- 邮箱：example@email.com&#10;&#10;## 教育背景&#10;**学校名称** | 专业 | 时间&#10;&#10;## 实习经历&#10;&#10;提示：选中文本可以进行AI优化或扩写"
        disabled={isLoading || isProcessing}
      />
      
      {/* 选择工具栏 */}
      {showToolbar && (
        <SelectionToolbar
          position={toolbarPosition}
          selectedText={selection.text}
          onOptimize={handleOptimize}
          onExpand={handleExpand}
          onContract={handleContract}
          onClose={hideToolbar}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}