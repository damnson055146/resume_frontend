// src/components/UploadCV.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, FileText, File } from 'lucide-react';
import agentAPI from '../services/CVagentAPI.jsx';
import Button from '../Comcomponents/common/Button.jsx';

const UploadCV = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const [textInput, setTextInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

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

    console.log('开始处理文件上传:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      console.log('文件扩展名:', fileExtension);

      if (fileExtension === 'pdf') {
        console.log('处理PDF文件...');
        // 处理PDF文件
        const result = await agentAPI.parsePDFResume(file);
        console.log('PDF解析成功:', result);
        onUpload(result);
      } else if (['txt', 'doc', 'docx'].includes(fileExtension)) {
        console.log('处理文本文件...');
        // 处理文本文件
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result;
          try {
            console.log('开始解析文本内容...');
            const result = await agentAPI.parseTextResume(text);
            console.log('文本解析成功:', result);
            onUpload(result);
          } catch (error) {
            console.error('文本解析失败:', error);
            setUploadError(`文本解析失败: ${error.message || '未知错误'}`);
          }
        };
        reader.onerror = (e) => {
          console.error('文件读取失败:', e);
          setUploadError('文件读取失败，请重试');
        };
        reader.readAsText(file);
      } else {
        const errorMsg = `不支持的文件格式: ${fileExtension}，请上传PDF、TXT、DOC或DOCX文件`;
        console.warn(errorMsg);
        setUploadError(errorMsg);
      }
    } catch (error) {
      console.error('文件上传失败详细信息:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = '文件上传失败';
      
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络连接或稍后重试';
      } else if (error.message.includes('timeout')) {
        errorMessage = '上传超时，请检查网络或稍后重试';
      } else if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
        errorMessage = '文件过大，请选择较小的文件';
      } else if (error.message.includes('415') || error.message.includes('Unsupported Media Type')) {
        errorMessage = '文件格式不支持，请上传PDF格式文件';
      } else if (error.message.includes('500')) {
        errorMessage = '服务器内部错误，请稍后重试';
      } else {
        errorMessage = `上传失败: ${error.message}`;
      }
      
      setUploadError(errorMessage);
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

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('');
    
    try {
      const result = await agentAPI.testConnection();
      
      if (result.success) {
        setConnectionStatus('✅ 服务器连接正常');
      } else {
        setConnectionStatus(`❌ 连接失败: ${result.error || `HTTP ${result.status}`}`);
      }
    } catch (error) {
      setConnectionStatus(`❌ 连接测试失败: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
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
          <div className="flex items-center gap-3">
            <Button
              onClick={testConnection}
              disabled={testingConnection}
              type="secondary"
              size="sm"
              className="text-xs"
            >
              {testingConnection ? '测试中...' : '测试连接'}
            </Button>
            <Button onClick={onClose} type="ghost" size="sm">
              <X size={24} />
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {uploadError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{uploadError}</p>
              <Button onClick={clearError} type="ghost" size="sm">
                <X size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* 连接状态提示 */}
        {connectionStatus && (
          <div className={`mx-6 mt-4 p-3 rounded-md ${
            connectionStatus.startsWith('✅') 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${
                connectionStatus.startsWith('✅') ? 'text-green-700' : 'text-red-700'
              }`}>
                {connectionStatus}
              </p>
                             <Button 
                onClick={() => setConnectionStatus('')} 
                type="ghost" 
                size="sm"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* 模态框内容 */}
        <div className="flex-1 overflow-auto p-6">
          {/* 文件上传区域 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
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
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  type="primary"
                  size="sm"
                  className="ml-2"  // 左侧增加间距
                >
                  点击上传
                </Button>
              </p>
              <p className="text-sm text-gray-500">当前支持 PDF 格式</p>

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
              placeholder="请在此处粘贴您的简历内容...&#10;&#10;支持纯文本格式，AI将自动解析并提取：&#10;• 基本信息（姓名、年龄、联系方式等）&#10;• 教育背景&#10;• 实习经历&#10;• 项目经历&#10;• 校外活动"
              disabled={uploading}
            />
          </div>
        </div>

        {/* 模态框底部 */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <Button onClick={onClose} disabled={uploading} type="ghost">
            取消
          </Button>
          <Button
            onClick={handleTextUpload}
            disabled={!textInput.trim() || uploading}
            type="primary"
          >
            {uploading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {uploading ? '正在解析...' : '解析简历'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadCV;