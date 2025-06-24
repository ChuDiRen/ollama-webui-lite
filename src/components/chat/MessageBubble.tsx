import React, { useState } from 'react'
import { Button, Space, message as antMessage, Typography, Input } from 'antd'
import {
  CopyOutlined,
  RedoOutlined,
  CheckOutlined,
  UserOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'
import type { Message } from '@/contexts/AppContext'

const { Text } = Typography
const { TextArea } = Input

interface MessageBubbleProps {
  message: Message
  isLast: boolean
  onRegenerate: () => void
  onEdit?: (messageId: string, newContent: string) => void
  showRegenerate: boolean
}

// 配置marked
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true,
})

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLast,
  onRegenerate,
  onEdit,
  showRegenerate,
}) => {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  // 复制消息内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      antMessage.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      antMessage.error('复制失败')
    }
  }

  // 开始编辑
  const handleStartEdit = () => {
    setIsEditing(true)
    setEditContent(message.content)
  }

  // 确认编辑
  const handleConfirmEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  // 渲染Markdown内容
  const renderContent = () => {
    if (message.role === 'user') {
      return (
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
      )
    }

    // AI回复使用Markdown渲染
    try {
      const html = marked(message.content)
      return (
        <div
          className={`
            prose prose-sm max-w-none leading-relaxed
            ${isUser ? 'prose-invert' : 'dark:prose-invert'}
            prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
            prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-3
            prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm
            prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4
            prose-blockquote:border-l-4 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
            prose-ul:list-disc prose-ol:list-decimal prose-ul:ml-4 prose-ol:ml-4
            prose-li:text-gray-800 dark:prose-li:text-gray-200 prose-li:mb-1
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
            prose-em:text-gray-700 dark:prose-em:text-gray-300
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-table:border-collapse prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-600
            prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-50 dark:prose-th:bg-gray-700 prose-th:p-2
            prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:p-2
          `}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    } catch (error) {
      console.error('Markdown render error:', error)
      return (
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
      )
    }
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group mb-8 chat-message message-bubble`}
    >
      <div
        className={`flex items-start space-x-4 max-w-[90%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      >
        {/* 头像 */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-blue-100 dark:ring-blue-900">
              <UserOutlined className="text-white text-base" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg ring-2 ring-emerald-100 dark:ring-emerald-900">
              <img
                src="/ollama.png"
                alt="AI助手"
                className="w-7 h-7 rounded-full"
              />
            </div>
          )}
        </div>

        {/* 消息内容 */}
        <div
          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0`}
        >
          {/* 发送者标识 */}
          <div className={`mb-2 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {isUser ? '您' : 'AI助手'}
            </Text>
          </div>

          {/* 消息气泡 */}
          <div
            className={`
              relative px-5 py-4 rounded-3xl shadow-lg transition-all duration-300 max-w-full group-hover:shadow-xl
              ${
                isUser
                  ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-br-lg shadow-blue-200 dark:shadow-blue-900/30'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-lg shadow-gray-200 dark:shadow-gray-900/30'
              }
              ${isLast && !message.done ? 'animate-pulse' : ''}
              hover:scale-[1.02] transform-gpu
            `}
          >
            {/* 消息内容 */}
            <div
              className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <TextArea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    autoSize={{ minRows: 2, maxRows: 10 }}
                    className="bg-transparent border-gray-300 dark:border-gray-600 text-sm rounded-lg"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="small"
                      onClick={handleCancelEdit}
                      className="rounded-lg"
                    >
                      取消
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={handleConfirmEdit}
                      className="rounded-lg"
                    >
                      确认
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="break-words">{renderContent()}</div>
              )}
            </div>

            {/* 加载状态 */}
            {!message.done && (
              <div className="mt-3 flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70" />
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70"
                  style={{ animationDelay: '0.2s' }}
                />
                <Text className="text-xs ml-2 opacity-70">正在生成...</Text>
              </div>
            )}
          </div>

          {/* 时间戳 */}
          <div className={`mt-2 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(message.timestamp)}
            </Text>
          </div>

          {/* 操作按钮 */}
          {message.done && !isEditing && (
            <div
              className={`
              mt-3 message-actions transition-all duration-300
              ${isUser ? 'flex justify-end' : 'flex justify-start'}
            `}
            >
              <Space
                size="small"
                className="bg-white dark:bg-gray-700 rounded-lg shadow-md px-2 py-1 border border-gray-200 dark:border-gray-600"
              >
                {/* 复制按钮 */}
                <Button
                  type="text"
                  size="small"
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={handleCopy}
                  className={`
                    rounded-md transition-all duration-200 hover:scale-105
                    ${
                      copied
                        ? 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }
                  `}
                  title="复制"
                />

                {/* 编辑按钮 */}
                {onEdit && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleStartEdit}
                    className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-all duration-200 hover:scale-105"
                    title="编辑"
                  />
                )}

                {/* 重新生成按钮 */}
                {showRegenerate && (
                  <Button
                    type="text"
                    size="small"
                    icon={<RedoOutlined />}
                    onClick={onRegenerate}
                    className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-all duration-200 hover:scale-105"
                    title="重新生成"
                  />
                )}
              </Space>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
