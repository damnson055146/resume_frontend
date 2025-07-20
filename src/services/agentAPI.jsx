// src/services/agentAPI.js
const API_BASE_URL = 'http://47.93.166.93:8699';//待改
const API_KEY = '9589ca16aa2844de6975809fbac3891ef2a105eadcde6f56e044c60b6b774ec4';//待改

// 通用请求配置
const getHeaders = (contentType = 'application/json') => ({
  'X-API-Key': API_KEY,
  ...(contentType && { 'Content-Type': contentType })
});

// 通用错误处理
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};

const agentAPI = {
  // 生成PDF简历
  generatePDF: async (resumeData, style = 1) => {
    const response = await fetch(`${API_BASE_URL}/generate-resume/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...resumeData,
        style: style
      })
    });
    
    await handleResponse(response);
    const blob = await response.blob();
    return {
      data: URL.createObjectURL(blob),
      blob: blob
    };
  },

  // 上传PDF并解析
  parsePDFResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/parse-resume/`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
        // 不要设置Content-Type，让浏览器自动设置
      },
      body: formData
    });
    
    await handleResponse(response);
    return await response.json();
  },

  // 解析文本简历
  parseTextResume: async (text) => {
    const response = await fetch(`${API_BASE_URL}/parse-resume-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    
    await handleResponse(response);
    return await response.json();
  },

  // 文本润色
  rewriteText: async (text) => {
    const response = await fetch(`${API_BASE_URL}/rewrite-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    
    await handleResponse(response);
    return await response.json();
  },

  // 文本扩写
  expandText: async (text) => {
    const response = await fetch(`${API_BASE_URL}/expand-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    
    await handleResponse(response);
    return await response.json();
  },

  //  文本缩写
  contractText: async (text) => {
    const response = await fetch(`${API_BASE_URL}/contract-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    
    await handleResponse(response);
    return await response.json();
  },

  // 简历评估
  evaluateResume: async (resumeData) => {
    const response = await fetch(`${API_BASE_URL}/process_json_to_text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resumeData)
    });
    
    await handleResponse(response);
    return await response.json();
  }
};

export default agentAPI;