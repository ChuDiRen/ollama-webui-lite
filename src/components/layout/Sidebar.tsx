import React, { useState, useRef } from 'react'
import {
  Button,
  List,
  Typography,
  Space,
  Dropdown,
  Modal,
  Input,
  message,
  Empty,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  MessageOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useApp } from '@/contexts/AppContext'
import { useTheme } from '@/contexts/ThemeContext'
import type { Chat } from '@/contexts/AppContext'

const { Title, Text } = Typography

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { state, dispatch } = useApp()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { id: currentChatId } = useParams()

  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 创建新对话
  const handleNewChat = () => {
    const newChatId = uuidv4()
    const newChat: Chat = {
      id: newChatId,
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    dispatch({ type: 'ADD_CHAT', payload: newChat })
    navigate(`/c/${newChatId}`)
  }

  // 选择对话
  const handleSelectChat = (chatId: string) => {
    navigate(`/c/${chatId}`)
  }

  // 开始编辑标题
  const handleEditTitle = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditingTitle(chat.title)
  }

  // 保存标题
  const handleSaveTitle = async () => {
    if (!editingChatId || !editingTitle.trim()) return

    const chat = state.chats.find(c => c.id === editingChatId)
    if (chat) {
      const updatedChat = {
        ...chat,
        title: editingTitle.trim(),
        updatedAt: Date.now(),
      }

      dispatch({ type: 'UPDATE_CHAT', payload: updatedChat })

      // 保存到数据库
      if (state.db) {
        await state.db.put('chats', updatedChat)
      }

      message.success('标题已更新')
    }

    setEditingChatId(null)
    setEditingTitle('')
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditingTitle('')
  }

  // 删除对话
  const handleDeleteChat = (chat: Chat) => {
    Modal.confirm({
      title: '删除对话',
      content: `确定要删除对话"${chat.title}"吗？此操作无法撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        dispatch({ type: 'DELETE_CHAT', payload: chat.id })

        // 从数据库删除
        if (state.db) {
          await state.db.delete('chats', chat.id)
        }

        // 如果删除的是当前对话，跳转到首页
        if (currentChatId === chat.id) {
          navigate('/')
        }

        message.success('对话已删除')
      },
    })
  }

  // 导出单个对话
  const handleExportChat = (chat: Chat) => {
    const content = chat.messages
      .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
      .join('\n\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${chat.title}.txt`
    link.click()
    URL.revokeObjectURL(url)

    message.success('对话已导出')
  }

  // 导出所有对话
  const handleExportAllChats = () => {
    const exportData = {
      version: '1.0.0',
      timestamp: Date.now(),
      chats: state.chats,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `聊天记录导出-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    message.success('所有对话已导出')
  }

  // 导入对话
  const handleImportChats = () => {
    fileInputRef.current?.click()
  }

  // 处理文件导入
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async e => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        if (importData.chats && Array.isArray(importData.chats)) {
          // 导入聊天记录
          for (const chat of importData.chats) {
            dispatch({ type: 'ADD_CHAT', payload: chat })

            // 保存到数据库
            if (state.db) {
              await state.db.put('chats', chat)
            }
          }

          message.success(`成功导入 ${importData.chats.length} 个对话`)
        } else {
          throw new Error('无效的文件格式')
        }
      } catch (error) {
        console.error('Import failed:', error)
        message.error('导入失败，请检查文件格式')
      }
    }

    reader.readAsText(file)
    event.target.value = '' // 清空input
  }

  // 清除所有对话
  const handleClearAllChats = async () => {
    try {
      // 清空状态
      dispatch({ type: 'SET_CHATS', payload: [] })
      dispatch({ type: 'SET_CURRENT_CHAT', payload: null })

      // 清空数据库
      if (state.db) {
        const tx = state.db.transaction('chats', 'readwrite')
        await tx.objectStore('chats').clear()
        await tx.done
      }

      navigate('/')
      message.success('所有对话已清除')
    } catch (error) {
      console.error('Clear chats failed:', error)
      message.error('清除失败')
    }

    setShowClearConfirm(false)
  }

  // 对话菜单项
  const getChatMenuItems = (chat: Chat) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => handleEditTitle(chat),
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: '导出',
      onClick: () => handleExportChat(chat),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDeleteChat(chat),
    },
  ]

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = dayjs()
    const time = dayjs(timestamp)

    if (now.diff(time, 'day') === 0) {
      return time.format('HH:mm')
    } else if (now.diff(time, 'day') === 1) {
      return '昨天'
    } else if (now.diff(time, 'week') === 0) {
      return time.format('dddd')
    } else {
      return time.format('MM/DD')
    }
  }

  if (collapsed) return null

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewChat}
          className="w-full h-10 flex items-center justify-center"
          size="large"
        >
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto">
        {state.chats.length === 0 ? (
          <div className="p-4">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无对话"
              className="text-gray-500"
            />
          </div>
        ) : (
          <List
            className="p-2"
            dataSource={state.chats}
            renderItem={chat => (
              <List.Item
                className={`
                  !px-3 !py-2 mb-1 rounded-lg cursor-pointer transition-all duration-200
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${
                    currentChatId === chat.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                      : 'border-l-4 border-transparent'
                  }
                `}
                onClick={() => handleSelectChat(chat.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <MessageOutlined className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <Input
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onPressEnter={handleSaveTitle}
                          onBlur={handleSaveTitle}
                          onKeyDown={e => {
                            if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                          className="!p-0 !border-0 !shadow-none"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <div>
                          <Text
                            className="block text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                            title={chat.title}
                          >
                            {chat.title}
                          </Text>
                          <Text className="block text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(chat.updatedAt)}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingChatId !== chat.id && (
                    <Dropdown
                      menu={{ items: getChatMenuItems(chat) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        size="small"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => e.stopPropagation()}
                      />
                    </Dropdown>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* 导入导出按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="small"
            icon={<ImportOutlined />}
            onClick={handleImportChats}
            className="flex items-center justify-center"
          >
            导入
          </Button>
          <Button
            size="small"
            icon={<ExportOutlined />}
            onClick={handleExportAllChats}
            className="flex items-center justify-center"
          >
            导出
          </Button>
        </div>

        {/* 清除对话按钮 */}
        {state.chats.length > 0 && (
          <Button
            size="small"
            danger
            icon={<ClearOutlined />}
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center"
          >
            清除对话
          </Button>
        )}

        <Divider className="!my-2" />

        {/* 版本信息 */}
        <div className="text-center">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Ollama WebUI Lite v1.0.0
          </Text>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />

        {/* 清除确认模态框 */}
        <Modal
          title="清除所有对话"
          open={showClearConfirm}
          onOk={handleClearAllChats}
          onCancel={() => setShowClearConfirm(false)}
          okText="确认清除"
          cancelText="取消"
          okType="danger"
        >
          <p>确定要清除所有对话记录吗？此操作无法撤销。</p>
        </Modal>
      </div>
    </div>
  )
}

export default Sidebar
