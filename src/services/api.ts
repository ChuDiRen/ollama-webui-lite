import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { OLLAMA_API_BASE_URL } from '@/constants'

// API响应类型
export interface OllamaModel {
  name: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

export interface OllamaModelsResponse {
  models: OllamaModel[]
}

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream?: boolean
  options?: {
    temperature?: number
    top_k?: number
    top_p?: number
    repeat_penalty?: number
    num_ctx?: number
    [key: string]: any
  }
}

export interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaChatRequest {
  model: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  stream?: boolean
  options?: {
    temperature?: number
    top_k?: number
    top_p?: number
    repeat_penalty?: number
    num_ctx?: number
    [key: string]: any
  }
}

export interface OllamaChatResponse {
  model: string
  created_at: string
  message: {
    role: string
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

// API客户端类
class OllamaAPI {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = OLLAMA_API_BASE_URL) {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL,
      timeout: 60000, // 60秒超时
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('API Response Error:', error)
        return Promise.reject(error)
      }
    )
  }

  // 更新基础URL
  updateBaseURL(baseURL: string) {
    this.baseURL = baseURL
    this.client.defaults.baseURL = baseURL
  }

  // 检查服务状态
  async checkStatus(): Promise<boolean> {
    try {
      const response = await this.client.get('/tags')
      return response.status === 200
    } catch (error) {
      console.error('Ollama service check failed:', error)
      return false
    }
  }

  // 获取模型列表
  async getModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.get<OllamaModelsResponse>('/tags')
      return response.data.models || []
    } catch (error) {
      console.error('Failed to get models:', error)
      throw new Error('获取模型列表失败')
    }
  }

  // 生成文本（非流式）
  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    try {
      const response = await this.client.post<OllamaGenerateResponse>('/generate', {
        ...request,
        stream: false,
      })
      return response.data
    } catch (error) {
      console.error('Failed to generate:', error)
      throw new Error('生成文本失败')
    }
  }

  // 生成文本（流式）
  async generateStream(
    request: OllamaGenerateRequest,
    onChunk: (chunk: OllamaGenerateResponse) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line) as OllamaGenerateResponse
              onChunk(chunk)
              if (chunk.done) return
            } catch (error) {
              console.error('Failed to parse chunk:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate stream:', error)
      throw error
    }
  }

  // 聊天对话（非流式）
  async chat(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    try {
      const response = await this.client.post<OllamaChatResponse>('/chat', {
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
    request: OllamaChatRequest,
    onChunk: (chunk: OllamaChatResponse) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line) as OllamaChatResponse
              onChunk(chunk)
              if (chunk.done) return
            } catch (error) {
              console.error('Failed to parse chunk:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to chat stream:', error)
      throw error
    }
  }

  // 删除模型
  async deleteModel(name: string): Promise<void> {
    try {
      await this.client.delete(`/delete`, {
        data: { name },
      })
    } catch (error) {
      console.error('Failed to delete model:', error)
      throw new Error('删除模型失败')
    }
  }

  // 拉取模型
  async pullModel(
    name: string,
    onProgress?: (progress: any) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!onProgress) return

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const progress = JSON.parse(line)
              onProgress(progress)
            } catch (error) {
              console.error('Failed to parse progress:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to pull model:', error)
      throw error
    }
  }
}

// 创建默认实例
export const ollamaAPI = new OllamaAPI()

// 导出API类
export default OllamaAPI
