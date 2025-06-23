import axios, { AxiosInstance } from 'axios'

// DeepSeek API 配置
export const DEEPSEEK_API_BASE_URL = 'https://api.deepseek.com'
export const DEEPSEEK_API_VERSION = 'v1'

// DeepSeek API 类型定义
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekChatRequest {
  model: string
  messages: DeepSeekMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string | string[]
}

export interface DeepSeekChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string | null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface DeepSeekStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

export interface DeepSeekModel {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface DeepSeekModelsResponse {
  object: string
  data: DeepSeekModel[]
}

// DeepSeek API 客户端
class DeepSeekAPI {
  private client: AxiosInstance
  private apiKey: string
  private baseURL: string

  constructor(apiKey: string, baseURL: string = DEEPSEEK_API_BASE_URL) {
    this.apiKey = apiKey
    this.baseURL = baseURL
    
    this.client = axios.create({
      baseURL: `${baseURL}/${DEEPSEEK_API_VERSION}`,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`DeepSeek API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('DeepSeek API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`DeepSeek API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('DeepSeek API Response Error:', error)
        return Promise.reject(error)
      }
    )
  }

  // 更新 API Key
  updateApiKey(apiKey: string) {
    this.apiKey = apiKey
    this.client.defaults.headers['Authorization'] = `Bearer ${apiKey}`
  }

  // 检查服务状态
  async checkStatus(): Promise<boolean> {
    try {
      const response = await this.client.get('/models')
      return response.status === 200
    } catch (error) {
      console.error('DeepSeek service check failed:', error)
      return false
    }
  }

  // 获取模型列表
  async getModels(): Promise<DeepSeekModel[]> {
    try {
      const response = await this.client.get<DeepSeekModelsResponse>('/models')
      return response.data.data || []
    } catch (error) {
      console.error('Failed to get models:', error)
      throw new Error('获取模型列表失败')
    }
  }

  // 聊天对话（非流式）
  async chat(request: DeepSeekChatRequest): Promise<DeepSeekChatResponse> {
    try {
      const response = await this.client.post<DeepSeekChatResponse>('/chat/completions', {
        ...request,
        stream: false,
      })
      return response.data
    } catch (error) {
      console.error('Failed to chat:', error)
      throw new Error('聊天请求失败')
    }
  }

  // 聊天对话（流式）
  async chatStream(
    request: DeepSeekChatRequest,
    onChunk: (chunk: DeepSeekStreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${DEEPSEEK_API_VERSION}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
        signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          
          // 跳过空行和注释行
          if (!trimmedLine || trimmedLine.startsWith(':')) {
            continue
          }

          // 处理 SSE 格式的数据
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6) // 移除 "data: " 前缀
            
            // 检查是否是结束标记
            if (data === '[DONE]') {
              return
            }

            try {
              const chunk = JSON.parse(data) as DeepSeekStreamChunk
              onChunk(chunk)
              
              // 检查是否完成
              if (chunk.choices?.[0]?.finish_reason) {
                return
              }
            } catch (error) {
              console.error('Failed to parse chunk:', error, 'Data:', data)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to chat stream:', error)
      throw error
    }
  }

  // 计算 token 数量（估算）
  estimateTokens(text: string): number {
    // 简单的 token 估算：中文字符按 1.5 个 token 计算，英文单词按 1 个 token 计算
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const englishWords = text.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(word => word.length > 0).length
    return Math.ceil(chineseChars * 1.5 + englishWords)
  }

  // 验证 API Key
  async validateApiKey(): Promise<boolean> {
    try {
      await this.getModels()
      return true
    } catch (error) {
      return false
    }
  }
}

// 创建默认实例（需要在使用前设置 API Key）
export const deepSeekAPI = new DeepSeekAPI('')

// 导出 API 类
export default DeepSeekAPI
