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

    if (selectedText.trim() && start !== end) {
      setSelection({ start, end, text: selectedText });
      
      // 计算工具栏位置
      const rect = textarea.getBoundingClientRect();
      const textBeforeSelection = text.substring(0, start);
      const lines = textBeforeSelection.split('\n');
      const currentLine = lines.length - 1;
      const currentColumn = lines[lines.length - 1].length;
      
      // 估算选择文本的位置
      const lineHeight = 20;
      const charWidth = 7;
      
      const x = rect.left + Math.min(currentColumn * charWidth, rect.width - 200);
      const y = rect.top + currentLine * lineHeight - 50;
      
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
    setTimeout(handleTextSelection, 10);
  };

  // 处理键盘事件
  const handleKeyUp = (e) => {
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') {
      setTimeout(handleTextSelection, 10);
    }
  };

  // 隐藏工具栏
  const hideToolbar = () => {
    setShowToolbar(false);
    setSelection({ start: 0, end: 0, text: '' });
  };

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
        onClick={hideToolbar}
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