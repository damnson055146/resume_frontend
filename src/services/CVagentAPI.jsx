// src/services/CVagentAPI.jsx

const API_BASE_URL = 'http://47.93.166.93:8699';  // 后端地址，根据实际环境调整
const API_KEY = '9589ca16aa2844de6975809fbac3891ef2a105eadcde6f56e044c60b6b774ec4'; // 待改

// 通用请求头
const getHeaders = () => ({
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json',
});

// 统一响应处理
const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

const agentAPI = {
  /**
   * 测试API连接
   */
  testConnection: async () => {
    console.log('测试API连接:', API_BASE_URL);
    try {
      const res = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
        },
      });
      
      console.log('连接测试响应:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      });
      
      return {
        success: res.ok,
        status: res.status,
        statusText: res.statusText
      };
    } catch (error) {
      console.error('连接测试失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  /**
   * 1. 上传 PDF 并解析 → JSON (/parse-resume/)
   */
  parsePDFResume: async (file) => {
    console.log('parsePDFResume 开始执行:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      apiUrl: `${API_BASE_URL}/parse-resume/`
    });

    const formData = new FormData();
    formData.append('file', file);

    console.log('FormData 创建完成，开始发送请求...');

    try {
      const res = await fetch(`${API_BASE_URL}/parse-resume/`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          // 不手动设置 Content-Type，浏览器会自动添加 boundary
        },
        body: formData,
      });

      console.log('API 响应状态:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API 错误响应:', errorText);
        
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.detail || errorMessage;
        } catch (e) {
          console.warn('无法解析错误响应为JSON:', e);
        }
        
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log('PDF 解析成功:', result);
      return result;
    } catch (error) {
      console.error('parsePDFResume 执行失败:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('无法连接到服务器，请检查网络连接');
      }
      
      throw error;
    }
  },

  /**
   * 2. 上传简历文本并解析 → JSON (/parse-resume-text/)
   */
  parseTextResume: async (text) => {
    const res = await fetch(`${API_BASE_URL}/parse-resume-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  /**
   * 3. 生成 PDF 简历 → Blob (/generate-resume/)
   */
  generateResumePDF: async (profileJson) => {
    const res = await fetch(`${API_BASE_URL}/generate-resume/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileJson),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.blob();
  },

  
  /**
   * 5. 简历测评 → 文本 (/process_json_to_text/)
   *    直接传整个简历 JSON 对象
   */
  evaluateResume: async (resumeJson) => {
    const res = await fetch(`${API_BASE_URL}/process_json_to_text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resumeJson),
    });
    return handleResponse(res);
  },


  /**
   * 选区优化
   * @param {string} text - 选中的文本内容
   * @returns {Promise<{rewritten_text: string}>}
   */
  optimizeSelection: async (text) => {
    const res = await fetch(`${API_BASE_URL}/optimize-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  /**
   * 选区扩写
   * @param {string} text - 选中的文本内容
   * @returns {Promise<{expanded_text: string}>}
   */
  expandSelection: async (text) => {
    const res = await fetch(`${API_BASE_URL}/expand-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  /**
   * 选区缩写
   * @param {string} text - 选中的文本内容
   * @returns {Promise<{contracted_text: string}>}
   */
  contractSelection: async (text) => {
    const res = await fetch(`${API_BASE_URL}/contract-text/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  /**
   * 自定义提示词修改选区
   * @param {string} text - 选中的文本内容
   * @param {string} prompt - 自定义提示词
   * @returns {Promise<{modified_text: string}>}
   */
  customPromptSelection: async (text, prompt) => {
    const res = await fetch(`${API_BASE_URL}/modified-text-prompt/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        text,
        prompt,
      }),
    });
    return handleResponse(res);
  },
};

export default agentAPI;