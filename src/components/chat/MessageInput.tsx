import React, { useState, useRef, useEffect } from 'react'
import { Button, Input, Space, Typography } from 'antd'
import { SendOutlined, StopOutlined } from '@ant-design/icons'
import { useHotkeys } from 'react-hotkeys-hook'

const { TextArea } = Input
const { Text } = Typography

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onStopGeneration: () => void
  disabled?: boolean
  isGenerating?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStopGeneration,
  disabled = false,
  isGenerating = false,
}) => {
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const textAreaRef = useRef<any>(null)

  // 自动调整文本框高度
  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea
    if (textArea) {
      textArea.style.height = 'auto'
      textArea.style.height = Math.min(textArea.scrollHeight, 200) + 'px'
    }
  }

  // 发送消息
  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled || isGenerating) return

    onSendMessage(trimmedMessage)
    setMessage('')
    
    // 重置文本框高度
    setTimeout(() => {
      const textArea = textAreaRef.current?.resizableTextArea?.textArea
      if (textArea) {
        textArea.style.height = 'auto'
      }
    }, 0)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  // 快捷键
  useHotkeys('ctrl+enter', handleSend, { enableOnFormTags: ['textarea'] })
  useHotkeys('meta+enter', handleSend, { enableOnFormTags: ['textarea'] })

  // 监听消息变化，调整高度
  useEffect(() => {
    adjustTextAreaHeight()
  }, [message])

  // 聚焦到输入框
  useEffect(() => {
    if (!isGenerating && textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [isGenerating])

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        {/* 输入区域 */}
        <div className="relative">
          <div className="flex items-end space-x-4">
            {/* 文本输入框 */}
            <div className="flex-1 relative">
              <TextArea
                ref={textAreaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="输入您的消息... (Enter发送，Shift+Enter换行)"
                disabled={disabled}
                autoSize={{ minRows: 1, maxRows: 8 }}
                className={`
                  resize-none border-2 border-gray-300 dark:border-gray-600 rounded-2xl
                  focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
                  dark:bg-gray-800 dark:text-gray-100 transition-all duration-300
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
                  shadow-lg hover:shadow-xl focus:shadow-xl
                `}
                style={{
                  paddingRight: '70px',
                  paddingLeft: '20px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                }}
              />

              {/* 发送/停止按钮 */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isGenerating ? (
                  <Button
                    type="primary"
                    danger
                    icon={<StopOutlined />}
                    onClick={onStopGeneration}
                    size="middle"
                    className="flex items-center justify-center w-11 h-11 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    title="停止生成"
                  />
                ) : (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    size="middle"
                    className="flex items-center justify-center w-11 h-11 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 border-0"
                    title="发送消息 (Enter)"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 提示文本 */}
          <div className="mt-4 flex justify-between items-center">
            <Text className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span className="mr-1">💡</span>
              大语言模型可能会出错，请验证重要信息
            </Text>

            <Space className="text-xs text-gray-400 dark:text-gray-500" size="large">
              {message.length > 0 && (
                <Text className="text-xs flex items-center">
                  <span className="mr-1">📝</span>
                  {message.length} 字符
                </Text>
              )}
              <Text className="text-xs flex items-center">
                <span className="mr-1">⌨️</span>
                Enter 发送
              </Text>
            </Space>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageInput
