import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '@/contexts/AppContext'
import ChatInterface from '@/components/chat/ChatInterface'
import MessageInput from '@/components/chat/MessageInput'
import ModelSelector from '@/components/chat/ModelSelector'
import WelcomeScreen from '@/components/chat/WelcomeScreen'
import type { Message, Chat } from '@/contexts/AppContext'
import { apiManager } from '@/services/apiManager'

const ChatPage: React.FC = () => {
  const { state, dispatch } = useApp()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取当前聊天
  const currentChat = id ? state.chats.find(chat => chat.id === id) : null

  // 初始化消息和模型
  useEffect(() => {
    if (currentChat) {
      setCurrentMessages(currentChat.messages)
    } else {
      setCurrentMessages([])
    }

    // 设置默认模型
    if (state.models.length > 0 && !selectedModel) {
      setSelectedModel(state.models[0].name)
    }
  }, [currentChat, state.models, selectedModel])

  // 初始化 API 管理器
  useEffect(() => {
    // 设置 API 提供商
    if (state.settings.apiProvider) {
      apiManager.setProvider(state.settings.apiProvider)
    }

    // 设置 API 配置
    if (state.settings.API_BASE_URL) {
      apiManager.setOllamaBaseURL(state.settings.API_BASE_URL)
    }

    if (state.settings.DEEPSEEK_API_KEY) {
      apiManager.setDeepSeekApiKey(state.settings.DEEPSEEK_API_KEY)
    }
  }, [state.settings])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentMessages, autoScroll])

  // 保存聊天到数据库
  const saveChat = async (chat: Chat) => {
    if (state.db) {
      await state.db.put('chats', chat)
    }
  }

  // 生成聊天标题
  const generateChatTitle = async (firstMessage: string): Promise<string> => {
    try {
      const titlePrompt = `请为以下对话生成一个简短的标题（不超过20个字符）：\n\n${firstMessage}`
      const titleMessages: Message[] = [{
        id: 'title-gen',
        role: 'user',
        content: titlePrompt,
        timestamp: Date.now(),
        done: true,
      }]

      const title = await apiManager.chat(
        titleMessages,
        selectedModel,
        {
          temperature: 0.7,
          max_tokens: 50,
        }
      )

      return title.trim() || firstMessage.slice(0, 20) + (firstMessage.length > 20 ? '...' : '')
    } catch (error) {
      console.error('Failed to generate title:', error)
      return firstMessage.slice(0, 20) + (firstMessage.length > 20 ? '...' : '')
    }
  }

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedModel) {
      message.error('请输入消息内容并选择模型')
      return
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      done: true,
    }

    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      done: false,
    }

    // 更新消息列表
    const newMessages = [...currentMessages, userMessage, assistantMessage]
    setCurrentMessages(newMessages)
    setIsGenerating(true)
    setAutoScroll(true)

    // 创建或更新聊天
    let chatToUpdate: Chat
    if (currentChat) {
      chatToUpdate = {
        ...currentChat,
        messages: newMessages,
        updatedAt: Date.now(),
      }
    } else {
      // 创建新聊天
      const newChatId = id || uuidv4()
      chatToUpdate = {
        id: newChatId,
        title: '新对话',
        messages: newMessages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      if (!id) {
        navigate(`/c/${newChatId}`, { replace: true })
      }
    }

    dispatch({ type: currentChat ? 'UPDATE_CHAT' : 'ADD_CHAT', payload: chatToUpdate })

    try {
      // 创建AbortController用于取消请求
      abortControllerRef.current = new AbortController()

      let assistantContent = ''

      // 使用统一的 API 管理器进行流式聊天
      await apiManager.chatStream(
        newMessages.filter(msg => msg.role !== 'assistant' || msg.content), // 排除空的助手消息
        selectedModel,
        {
          temperature: state.settings.temperature,
          top_k: state.settings.top_k,
          top_p: state.settings.top_p,
          repeat_penalty: state.settings.repeat_penalty,
          num_ctx: state.settings.num_ctx,
          max_tokens: state.settings.max_tokens,
          ...state.settings.options,
        },
        (chunk) => {
          if (chunk.content) {
            assistantContent += chunk.content

            // 更新助手消息
            const updatedMessages = newMessages.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: assistantContent, done: chunk.done }
                : msg
            )
            setCurrentMessages(updatedMessages)

            // 更新聊天
            const updatedChat = {
              ...chatToUpdate,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
            dispatch({ type: 'UPDATE_CHAT', payload: updatedChat })
          }

          if (chunk.done) {
            // 生成标题（仅对新聊天的第一条消息）
            if (!currentChat && newMessages.length === 2) {
              generateChatTitle(content).then(async (title) => {
                const finalChat = {
                  ...chatToUpdate,
                  title,
                  messages: newMessages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantContent, done: true }
                      : msg
                  ),
                }
                dispatch({ type: 'UPDATE_CHAT', payload: finalChat })
                await saveChat(finalChat)
              })
            } else {
              saveChat(chatToUpdate)
            }
          }
        },
        abortControllerRef.current.signal
      )
    } catch (error: any) {
      if (error.name === 'AbortError') {
        message.info('请求已取消')
      } else {
        console.error('Failed to send message:', error)
        message.error('发送消息失败: ' + error.message)
        
        // 移除失败的消息
        setCurrentMessages(currentMessages)
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  // 停止生成
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  // 重新生成回复
  const handleRegenerateResponse = async (messageIndex: number) => {
    if (messageIndex < 1) return

    const userMessage = currentMessages[messageIndex - 1]
    if (userMessage.role !== 'user') return

    // 移除当前助手回复及之后的消息
    const newMessages = currentMessages.slice(0, messageIndex)
    setCurrentMessages(newMessages)

    // 重新发送用户消息
    await handleSendMessage(userMessage.content)
  }

  // 编辑消息
  const handleEditMessage = async (messageId: string, newContent: string) => {
    const messageIndex = currentMessages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1) return

    const message = currentMessages[messageIndex]

    if (message.role === 'user') {
      // 编辑用户消息，需要重新生成后续回复
      const updatedMessages = currentMessages.slice(0, messageIndex + 1)
      updatedMessages[messageIndex] = { ...message, content: newContent }
      setCurrentMessages(updatedMessages)

      // 重新发送编辑后的消息
      await handleSendMessage(newContent)
    } else {
      // 编辑助手消息，直接更新内容
      const updatedMessages = [...currentMessages]
      updatedMessages[messageIndex] = { ...message, content: newContent }
      setCurrentMessages(updatedMessages)

      // 更新聊天记录
      if (currentChat) {
        const updatedChat = {
          ...currentChat,
          messages: updatedMessages,
          updatedAt: Date.now(),
        }
        dispatch({ type: 'UPDATE_CHAT', payload: updatedChat })
        await saveChat(updatedChat)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 模型选择器 */}
      {currentMessages.length === 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <ModelSelector
            models={state.models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isGenerating}
          />
        </div>
      )}

      {/* 聊天内容 */}
      <div className="flex-1 overflow-hidden">
        {currentMessages.length === 0 ? (
          <WelcomeScreen onSendMessage={handleSendMessage} />
        ) : (
          <ChatInterface
            messages={currentMessages}
            isGenerating={isGenerating}
            autoScroll={autoScroll}
            onAutoScrollChange={setAutoScroll}
            onRegenerateResponse={handleRegenerateResponse}
            onEditMessage={handleEditMessage}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 消息输入 */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        disabled={!selectedModel || state.models.length === 0}
        isGenerating={isGenerating}
      />
    </div>
  )
}

export default ChatPage
