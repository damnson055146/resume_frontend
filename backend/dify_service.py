import requests
import logging
from typing import Optional
import json

# 配置日志
logger = logging.getLogger(__name__)

# Dify API 配置
DIFY_API_BASE_URL = "https://api.dify.ai/v1"  # 或您的自部署地址
DIFY_API_KEY_CUSTOM_REWRITE = "app-your-workflow-api-key"  # Workflow API Key
DIFY_API_KEY_CHAT_REWRITE = "app-your-chat-api-key"      # Chat API Key（如果使用对话模式）

# 请求超时时间
REQUEST_TIMEOUT = 120

def call_dify_custom_rewrite(text: str, prompt: str) -> str:
    """
    调用 Dify 自定义文本修改接口（Workflow模式）
    
    Args:
        text (str): 需要修改的原始文本
        prompt (str): 用户的修改指令/提示词
    
    Returns:
        str: 修改后的文本，若出错则返回错误描述
    """
    headers = {
        'Authorization': f'Bearer {DIFY_API_KEY_CUSTOM_REWRITE}',
        'Content-Type': 'application/json'
    }
    
    # Workflow 模式的 payload
    payload = {
        "inputs": {
            "text": text,
            "prompt": prompt
        },
        "response_mode": "blocking",
        "user": "text-rewrite-user"
    }
    
    try:
        logger.info(f"调用Dify文本修改API - 文本长度: {len(text)}, 指令: {prompt[:50]}...")
        
        # 调用 Workflow API
        response = requests.post(
            f"{DIFY_API_BASE_URL}/workflows/run",
            headers=headers,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )
        
        response.raise_for_status()
        result = response.json()
        
        logger.info(f"Dify API响应状态: {response.status_code}")
        logger.debug(f"完整响应: {result}")
        
        # 从Workflow响应中提取结果
        modified_text = result.get('data', {}).get('outputs', {}).get('modified_text', '')
        
        if not modified_text:
            # 尝试其他可能的响应结构
            modified_text = result.get('outputs', {}).get('modified_text', '')
        
        if modified_text:
            logger.info("文本修改成功")
            return modified_text
        else:
            logger.error(f"Dify未能返回有效的修改结果: {result}")
            return f"Dify未能返回有效的修改结果。响应结构: {list(result.keys())}"
            
    except requests.exceptions.Timeout:
        error_msg = "调用Dify文本修改功能超时"
        logger.error(error_msg)
        return error_msg
    except requests.exceptions.RequestException as e:
        error_msg = f"调用Dify文本修改功能网络错误: {e}"
        logger.error(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"调用Dify文本修改功能失败: {e}"
        logger.error(error_msg)
        return error_msg

def call_dify_custom_rewrite_chat(text: str, prompt: str) -> str:
    """
    调用 Dify 自定义文本修改接口（Chat对话模式）
    适用于您当前使用的对话应用风格
    
    Args:
        text (str): 需要修改的原始文本
        prompt (str): 用户的修改指令/提示词
    
    Returns:
        str: 修改后的文本，若出错则返回错误描述
    """
    headers = {
        'Authorization': f'Bearer {DIFY_API_KEY_CHAT_REWRITE}',
        'Content-Type': 'application/json'
    }
    
    # 构建对话查询内容
    query_text = f"""请根据以下指令修改文本内容，只返回修改后的文本，不要添加任何解释：

原始文本：
{text}

修改指令：
{prompt}

修改后的文本："""
    
    # Chat 模式的 payload（与您现有代码风格一致）
    payload = {
        "inputs": {},
        "query": query_text,
        "response_mode": "blocking",
        "user": "text-rewrite-chat-user"
    }
    
    try:
        logger.info(f"调用Dify文本修改API(Chat模式) - 文本长度: {len(text)}, 指令: {prompt[:50]}...")
        
        # 调用 Chat API
        response = requests.post(
            f"{DIFY_API_BASE_URL}/chat-messages",
            headers=headers,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )
        
        response.raise_for_status()
        result = response.json()
        
        logger.info(f"Dify Chat API响应状态: {response.status_code}")
        logger.debug(f"完整响应: {result}")
        
        # 从Chat响应中提取结果
        modified_text = result.get('answer', '').strip()
        
        if modified_text:
            logger.info("文本修改成功")
            return modified_text
        else:
            logger.error(f"Dify未能返回有效的修改结果: {result}")
            return "Dify未能返回有效的修改结果。"
            
    except requests.exceptions.Timeout:
        error_msg = "调用Dify文本修改功能超时"
        logger.error(error_msg)
        return error_msg
    except requests.exceptions.RequestException as e:
        error_msg = f"调用Dify文本修改功能网络错误: {e}"
        logger.error(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"调用Dify文本修改功能失败: {e}"
        logger.error(error_msg)
        return error_msg

def call_dify_optimize_text(text: str) -> str:
    """
    调用 Dify 文本优化接口
    """
    return call_dify_custom_rewrite(text, "请优化这段文本，使其表达更加清晰、准确、专业")

def call_dify_expand_text(text: str) -> str:
    """
    调用 Dify 文本扩写接口
    """
    return call_dify_custom_rewrite(text, "请扩写这段文本，增加更多详细信息和具体描述，但保持核心意思不变")

def call_dify_contract_text(text: str) -> str:
    """
    调用 Dify 文本精简接口
    """
    return call_dify_custom_rewrite(text, "请精简这段文本，保留核心信息，删除冗余内容，使表达更加简洁") 