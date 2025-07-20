// src/components/AIToolbar.jsx
import React from 'react';

const AIToolbar = ({ 
  editContent, 
  handleAIAction, 
  handleSaveChanges,
  isLoading
}) => {
  // 按钮基础样式
  const baseButtonClass = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // 按钮变体样式
  const buttonVariants = {
    evaluate: `${baseButtonClass} bg-purple-50 text-purple-700 hover:bg-purple-100 focus:ring-purple-300 border border-purple-200 hover:border-purple-300`,
    polish: `${baseButtonClass} bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-300 border border-green-200 hover:border-green-300`,
    expand: `${baseButtonClass} bg-orange-50 text-orange-700 hover:bg-orange-100 focus:ring-orange-300 border border-orange-200 hover:border-orange-300`,
    contract: `${baseButtonClass} bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:ring-yellow-300 border border-yellow-200 hover:border-yellow-300`,
    save: `${baseButtonClass} bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-300 border border-blue-200 hover:border-blue-300`
  };

  return (
    <div className="h-16 flex justify-between items-center px-6 py-3 border-t border-gray-200 bg-white flex-shrink-0">
      <div className="text-xs text-gray-500 font-sans">
        {editContent ? `${editContent.length} 字符` : '无内容'}
      </div>
      
      <div className="flex items-center gap-4">
        {/* 简历评估 */}
        <button
          onClick={() => handleAIAction('evaluate')}
          disabled={!editContent || isLoading}
          className={buttonVariants.evaluate}
          aria-label="简历测评"
        >
          {isLoading ? '处理中...' : '简历测评'}
        </button>
        
        {/* 简历润色 */}
        <button
          onClick={() => handleAIAction('polish')}
          disabled={!editContent || isLoading}
          className={buttonVariants.polish}
          aria-label="简历润色"
        >
          {isLoading ? '处理中...' : '简历润色'}
        </button>
        
        {/* 简历扩写 */}
        <button
          onClick={() => handleAIAction('expand')}
          disabled={!editContent || isLoading}
          className={buttonVariants.expand}
          aria-label="简历扩写"
        >
          {isLoading ? '处理中...' : '简历扩写'}
        </button>
        
        {/* 简历缩写 */}
        <button
          onClick={() => handleAIAction('contract')}
          disabled={!editContent || isLoading}
          className={buttonVariants.contract}
          aria-label="简历缩写"
        >
          {isLoading ? '处理中...' : '简历缩写'}
        </button>
        
        {/* 分割线 */}
        <div className="h-5 w-px bg-gray-200 mx-1" aria-hidden="true" />
        
        {/* 保存修改 */}
        <button
          onClick={handleSaveChanges}
          disabled={!editContent || isLoading}
          className={buttonVariants.save}
          aria-label="保存修改"
        >
          {isLoading ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  );
};

export default AIToolbar;