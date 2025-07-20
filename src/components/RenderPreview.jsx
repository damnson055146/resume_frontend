// src/components/RenderPreview.jsx
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import agentAPI from '../services/agentAPI';

export default function RenderPreview({ content, config, setConfig, resumeData }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!resumeData) {
      alert('请先上传或编辑简历数据');
      return;
    }

    setLoading(true);
    try {
      const fullResumeData = {
        ...resumeData,
        // 确保有必要的字段
        user_uid: resumeData.user_uid || `user-${Date.now()}`,
        user_name: resumeData.user_name || '未知用户',
        // 如果有编辑的内容，添加到数据中
        raw_content: content
      };

      // 调用API生成PDF
      const result = await agentAPI.generatePDF(fullResumeData, config.style || 1);
      
      // 下载链接
      const link = document.createElement('a');
      link.href = result.data;
      link.download = `${resumeData.user_name || 'resume'}_简历.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      URL.revokeObjectURL(result.data);
    } catch (error) {
      console.error('生成PDF失败:', error);
      alert('生成PDF失败，请检查网络连接或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div
        className="flex-1 p-6 overflow-y-auto bg-white"
        style={{
          fontFamily: config.font,
          fontSize: `${config.fontSize}pt`,
          lineHeight: config.lineHeight,
        }}
      >
        <div className="max-w-none prose prose-sm">
          {content ? (
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mb-3 text-gray-800 mt-6">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium mb-2 text-gray-700 mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 text-gray-600 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 ml-6 list-disc text-gray-600">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 ml-6 list-decimal text-gray-600">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-800">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700">
                    {children}
                  </em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-gray-800">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto text-gray-800">
                      <code>{children}</code>
                    </pre>
                  ),
                table: ({ children }) => (
                  <table className="w-full border-collapse border border-gray-300 my-4">
                    {children}
                  </table>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 px-3 py-2 bg-gray-50 text-left font-semibold text-gray-800">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">
                    {children}
                  </td>
                ),
                hr: () => (
                  <hr className="my-6 border-gray-300" />
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <div className="text-gray-400 text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-lg">简历预览将在这里显示</p>
              <p className="text-sm mt-2">请先上传简历</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 底部工具栏 */}
      <div className="h-16 flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            {content ? `${content.length} 字符` : '无内容'}
          </span>
          {resumeData?.user_name && (
            <span className="text-gray-600">
              • {resumeData.user_name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* 样式选择 */}
          <select
            className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={config.style || 1}
            onChange={(e) => {
              setConfig({ ...config, style: parseInt(e.target.value) });
            }}
          >
            <option value="1">样式1</option>
            <option value="2">样式2</option>
          </select>
          
          <button
            onClick={handleDownload}
            disabled={loading || !content || !resumeData}
            className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {loading ? '生成中...' : '保存为 PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}