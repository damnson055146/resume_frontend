// src/components/UploadCV.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, FileText, File } from 'lucide-react';
import agentAPI from '../services/agentAPI';

const UploadCV = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const [textInput, setTextInput] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    setUploadError('');
    
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'pdf') {
        // 处理PDF文件
        const result = await agentAPI.parsePDFResume(file);
        onUpload(result);
      } else if (['txt', 'doc', 'docx'].includes(fileExtension)) {
        // 处理文本文件
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result;
          try {
            const result = await agentAPI.parseTextResume(text);
            onUpload(result);
          } catch (error) {
            console.error('文本解析失败:', error);
            setUploadError('文本解析失败，请重试');
          }
        };
        reader.readAsText(file);
      } else {
        setUploadError('不支持的文件格式，请上传PDF、TXT、DOC或DOCX文件');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      setUploadError('文件上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };
  //接收后端JSON
  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      setUploadError('请输入简历内容');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    
    try {
      const result = await agentAPI.parseTextResume(textInput);
      onUpload(result);
    } catch (error) {
      console.error('文本解析失败:', error);
      setUploadError('文本解析失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const clearError = () => {
    setUploadError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} />
            上传简历
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 错误提示 */}
        {uploadError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{uploadError}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 模态框内容 */}
        <div className="flex-1 overflow-auto p-6">
          {/* 文件上传区域 */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="h-8 w-8 text-gray-400" />
                <File className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg text-gray-600 mb-2">
                拖拽文件到此处或 
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                >
                  点击上传
                </button>
              </p>
              <p className="text-sm text-gray-500">支持 PDF 格式</p>
              <p className="text-xs text-gray-400 mt-1">TXT、DOC、DOCX 解析功能待添加</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>

          {/* 分割线 */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">或</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* 文本输入区域 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              直接粘贴简历内容
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请在此处粘贴您的简历内容...&#10;&#10;支持纯文本格式，AI将自动解析并提取：&#10;• 基本信息（姓名、年龄、联系方式等）&#10;• 教育背景&#10;• 实习经历&#10;• 项目经历&#10;• 其他相关信息"
              disabled={uploading}
            />
          </div>
        </div>

        {/* 模态框底部 */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleTextUpload}
            disabled={!textInput.trim() || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {uploading ? '正在解析...' : '解析简历'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCV;