// src/components/SelectionToolbar.jsx
import { useState } from 'react';
import { Sparkles, PenTool, Minus, X } from 'lucide-react';

export default function SelectionToolbar({ 
  position, 
  selectedText, 
  onOptimize, 
  onExpand, 
  onContract, 
  onClose, 
  isProcessing 
}) {
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 px-1 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '240px',
        maxWidth: '300px'
      }}
    >
      {/* 优化按钮 */}
      <button
        onClick={onOptimize}
        disabled={isProcessing}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI优化选中文本"
      >
        <Sparkles size={14} />
        优化
      </button>

      {/* 扩写按钮 */}
      <button
        onClick={onExpand}
        disabled={isProcessing}
        className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI扩写选中文本"
      >
        <PenTool size={14} />
        扩写
      </button>

      {/* 缩写按钮 */}
      <button
        onClick={onContract}
        disabled={isProcessing}
        className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI缩写选中文本"
      >
        <Minus size={14} />
        缩写
      </button>

      {/* 分割线 */}
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* 关闭button */}
      <button
        onClick={onClose}
        className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        title="关闭"
      >
        <X size={14} />
      </button>

      {/* 选中文本预览 */}
      <div className="ml-2 text-xs text-gray-500 max-w-32 truncate">
        "{selectedText}"
      </div>

      {/* 加载指示器 */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            处理中...
          </div>
        </div>
      )}

      {/* 箭头指示器 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200"></div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white -mt-1"></div>
      </div>
    </div>
  );
}