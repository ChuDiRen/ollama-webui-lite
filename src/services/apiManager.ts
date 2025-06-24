import { ollamaAPI, OllamaAPI } from './api'
import { deepSeekAPI, DeepSeekAPI } from './deepseekApi'
import type { Message } from '@/contexts/AppContext'

// API 提供商类型
export type APIProvider = 'ollama' | 'deepseek'

// 统一的消息格式
export interface UnifiedMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 统一的聊天请求
export interface UnifiedChatRequest {
  model: string
  messages: UnifiedMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
  top_k?: number
  repeat_penalty?: number
  num_ctx?: number
  [key: string]: unknown
}

// 统一的流式响应块
export interface UnifiedStreamChunk {
  content: string
  done: boolean
  model?: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

// 统一的模型信息
export interface UnifiedModel {
  id: string
  name: string
  provider: APIProvider
  size?: number
  description?: string
}

// API 管理器类
class APIManager {
  private currentProvider: APIProvider = 'ollama'
  private ollamaInstance: OllamaAPI
  private deepSeekInstance: DeepSeekAPI

  constructor() {
    this.ollamaInstance = ollamaAPI
    this.deepSeekInstance = deepSeekAPI
  }

  // 设置当前提供商
  setProvider(provider: APIProvider) {
    this.currentProvider = provider
  }

  // 获取当前提供商
  getCurrentProvider(): APIProvider {
    return this.currentProvider
  }

  // 设置 DeepSeek API Key
  setDeepSeekApiKey(apiKey: string) {
    this.deepSeekInstance.updateApiKey(apiKey)
  }

  // 设置 Ollama 基础 URL
  setOllamaBaseURL(baseURL: string) {
    this.ollamaInstance.updateBaseURL(baseURL)
  }

  // 检查服务状态
  async checkStatus(provider?: APIProvider): Promise<boolean> {
    const targetProvider = provider || this.currentProvider

    try {
      switch (targetProvider) {
        case 'ollama':
          return await this.ollamaInstance.checkStatus()
        case 'deepseek':
          return await this.deepSeekInstance.checkStatus()
        default:
          return false
      }
    } catch (error) {
      console.error(`Failed to check ${targetProvider} status:`, error)
      return false
    }
  }

  // 获取模型列表
  async getModels(provider?: APIProvider): Promise<UnifiedModel[]> {
    const targetProvider = provider || this.currentProvider

    try {
      switch (targetProvider) {
        case 'ollama': {
          const models = await this.ollamaInstance.getModels()
          return models.map(model => ({
            id: model.name,
            name: model.name,
            provider: 'ollama' as APIProvider,
            size: model.size,
            description:
              `${model.details?.family || ''} ${model.details?.parameter_size || ''}`.trim(),
          }))
        }
        case 'deepseek': {
          const models = await this.deepSeekInstance.getModels()
          return models.map(model => ({
            id: model.id,
            name: model.id,
            provider: 'deepseek' as APIProvider,
            description: `DeepSeek ${model.id}`,
          }))
        }
        default:
          return []
      }
    } catch (error) {
      console.error(`Failed to get ${targetProvider} models:`, error)
      throw error
    }
  }

  // 转换消息格式
  private convertMessages(messages: Message[]): UnifiedMessage[] {
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))
  }

  // 流式聊天
  async chatStream(
    messages: Message[],
    model: string,
    options: Partial<UnifiedChatRequest>,
    onChunk: (chunk: UnifiedStreamChunk) => void,
    signal?: AbortSignal,
    provider?: APIProvider
  ): Promise<void> {
    const targetProvider = provider || this.currentProvider
    const unifiedMessages = this.convertMessages(messages)

    try {
      switch (targetProvider) {
        case 'ollama': {
          // 使用 Ollama 的 generate API（单轮对话）或 chat API（多轮对话）
          if (messages.length === 1 && messages[0].role === 'user') {
            // 单轮对话使用 generate
            await this.ollamaInstance.generateStream(
              {
                model,
                prompt: messages[0].content,
                stream: true,
                options: {
                  temperature: options.temperature,
                  top_k: options.top_k,
                  top_p: options.top_p,
                  repeat_penalty: options.repeat_penalty,
                  num_ctx: options.num_ctx,
                },
              },
              chunk => {
                onChunk({
                  content: chunk.response || '',
                  done: chunk.done || false,
                  model: chunk.model,
                })
              },
              signal
            )
          } else {
            // 多轮对话使用 chat
            await this.ollamaInstance.chatStream(
              {
                model,
                messages: unifiedMessages,
                stream: true,
                options: {
                  temperature: options.temperature,
                  top_k: options.top_k,
                  top_p: options.top_p,
                  repeat_penalty: options.repeat_penalty,
                  num_ctx: options.num_ctx,
                },
              },
              chunk => {
                onChunk({
                  content: chunk.message?.content || '',
                  done: chunk.done || false,
                  model: chunk.model,
                })
              },
              signal
            )
          }
          break
        }
        case 'deepseek': {
          await this.deepSeekInstance.chatStream(
            {
              model,
              messages: unifiedMessages,
              stream: true,
              temperature: options.temperature,
              max_tokens: options.max_tokens,
              top_p: options.top_p,
            },
            chunk => {
              const content = chunk.choices?.[0]?.delta?.content || ''
              const finishReason = chunk.choices?.[0]?.finish_reason

              onChunk({
                content,
                done: finishReason !== null,
                model: chunk.model,
              })
            },
            signal
          )
          break
        }
        default:
          throw new Error(`Unsupported provider: ${targetProvider}`)
      }
    } catch (error) {
      console.error(`Failed to chat with ${targetProvider}:`, error)
      throw error
    }
  }

  // 非流式聊天
  async chat(
    messages: Message[],
    model: string,
    options: Partial<UnifiedChatRequest>,
    provider?: APIProvider
  ): Promise<string> {
    const targetProvider = provider || this.currentProvider
    const unifiedMessages = this.convertMessages(messages)

    try {
      switch (targetProvider) {
        case 'ollama': {
          if (messages.length === 1 && messages[0].role === 'user') {
            const response = await this.ollamaInstance.generate({
              model,
              prompt: messages[0].content,
              stream: false,
              options: {
                temperature: options.temperature,
                top_k: options.top_k,
                top_p: options.top_p,
                repeat_penalty: options.repeat_penalty,
                num_ctx: options.num_ctx,
              },
            })
            return response.response
          } else {
            const response = await this.ollamaInstance.chat({
              model,
              messages: unifiedMessages,
              stream: false,
              options: {
                temperature: options.temperature,
                top_k: options.top_k,
                top_p: options.top_p,
                repeat_penalty: options.repeat_penalty,
                num_ctx: options.num_ctx,
              },
            })
            return response.message.content
          }
        }
        case 'deepseek': {
          const response = await this.deepSeekInstance.chat({
            model,
            messages: unifiedMessages,
            stream: false,
            temperature: options.temperature,
            max_tokens: options.max_tokens,
            top_p: options.top_p,
          })
          return response.choices[0]?.message?.content || ''
        }
        default:
          throw new Error(`Unsupported provider: ${targetProvider}`)
      }
    } catch (error) {
      console.error(`Failed to chat with ${targetProvider}:`, error)
      throw error
    }
  }

  // 验证 API 配置
  async validateConfig(provider: APIProvider): Promise<boolean> {
    try {
      switch (provider) {
        case 'ollama':
          return await this.ollamaInstance.checkStatus()
        case 'deepseek':
          return await this.deepSeekInstance.validateApiKey()
        default:
          return false
      }
    } catch (error) {
      return false
    }
  }
}

// 创建全局实例
export const apiManager = new APIManager()

export default APIManager
