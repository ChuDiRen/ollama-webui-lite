import React, { useEffect, useRef, useCallback } from 'react'
import { FloatButton, Typography } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import type { Message } from '@/contexts/AppContext'

const { Text } = Typography

interface ChatInterfaceProps {
  messages: Message[]
  isGenerating: boolean
  autoScroll: boolean
  onAutoScrollChange: (autoScroll: boolean) => void
  onRegenerateResponse: (messageIndex: number) => void
  onEditMessage?: (messageId: string, newContent: string) => void
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isGenerating,
  autoScroll,
  onAutoScrollChange,
  onRegenerateResponse,
  onEditMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  // 检查是否滚动到底部
  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

    if (autoScroll !== isAtBottom) {
      onAutoScrollChange(isAtBottom)
    }
  }, [autoScroll, onAutoScrollChange])

  // 滚动到底部
  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 自动滚动处理
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll])

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', checkScrollPosition)
    return () => container.removeEventListener('scroll', checkScrollPosition)
  }, [checkScrollPosition])

  return (
    <div className="relative h-full">
      {/* 消息列表容器 */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto px-6 py-8 chat-container bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900"
        style={{
          scrollBehavior: autoScroll ? 'smooth' : 'auto',
        }}
      >
        {/* 消息列表 */}
        <div className="max-w-5xl mx-auto space-y-2">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              onRegenerate={() => onRegenerateResponse(index)}
              onEdit={onEditMessage}
              showRegenerate={
                message.role === 'assistant' &&
                index === messages.length - 1 &&
                message.done &&
                !isGenerating
              }
            />
          ))}

          {/* 打字指示器 */}
          {isGenerating && (
            <div className="flex justify-start mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg ring-2 ring-emerald-100 dark:ring-emerald-900 mt-1">
                  <img
                    src="/ollama.png"
                    alt="AI助手"
                    className="w-7 h-7 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 px-1">
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      AI助手
                    </Text>
                  </div>
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部占位符 */}
        <div ref={lastMessageRef} className="h-6" />
      </div>

      {/* 回到底部按钮 */}
      {!autoScroll && messages.length > 0 && (
        <FloatButton
          icon={<DownOutlined />}
          onClick={() => {
            onAutoScrollChange(true)
            scrollToBottom()
          }}
          className="!bottom-24 !right-6"
          tooltip="回到底部"
        />
      )}
    </div>
  )
}

export default ChatInterface
