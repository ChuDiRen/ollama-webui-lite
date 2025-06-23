import React, { useState } from 'react'
import { Layout, Button, Typography, Space, Dropdown, Avatar } from 'antd'
import {
  MenuOutlined,
  PlusOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '@/contexts/AppContext'
import { useTheme } from '@/contexts/ThemeContext'
import { APP_NAME } from '@/constants'
import SettingsModal from '@/components/common/SettingsModal'

const { Header } = Layout
const { Title } = Typography

interface NavbarProps {
  collapsed: boolean
  onToggleSider: () => void
}

const Navbar: React.FC<NavbarProps> = ({ collapsed, onToggleSider }) => {
  const { state, dispatch } = useApp()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)

  // 创建新对话
  const handleNewChat = () => {
    const newChatId = uuidv4()
    navigate(`/c/${newChatId}`)
  }

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => setShowSettings(true),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'theme',
      icon: theme === 'dark' ? <SunOutlined /> : <MoonOutlined />,
      label: theme === 'dark' ? '浅色模式' : '深色模式',
      onClick: toggleTheme,
    },
  ]

  // 获取当前聊天标题
  const getCurrentChatTitle = () => {
    if (state.currentChatId) {
      const currentChat = state.chats.find(chat => chat.id === state.currentChatId)
      return currentChat?.title || '新对话'
    }
    return APP_NAME
  }

  return (
    <Header
      className={`
        sticky top-0 z-30 px-4 h-16 flex items-center justify-between
        backdrop-blur-xl border-b transition-all duration-300
        ${theme === 'dark' 
          ? 'bg-gray-900/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
        }
      `}
      style={{
        boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* 左侧 */}
      <div className="flex items-center space-x-4">
        {/* 侧边栏切换按钮 */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onToggleSider}
          className="flex items-center justify-center w-8 h-8"
        />

        {/* 标题 */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <Title 
            level={4} 
            className="!mb-0 !text-gray-900 dark:!text-gray-100 truncate max-w-xs md:max-w-md"
          >
            {getCurrentChatTitle()}
          </Title>
        </div>
      </div>

      {/* 右侧 */}
      <Space size="middle">
        {/* 新建对话按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewChat}
          className="hidden sm:flex items-center"
        >
          新对话
        </Button>

        {/* 移动端新建按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewChat}
          className="sm:hidden"
          shape="circle"
        />

        {/* 用户菜单 */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button
            type="text"
            className="flex items-center space-x-2 h-10 px-3"
          >
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
              className="bg-gradient-to-br from-blue-500 to-purple-600"
            />
            <span className="hidden md:inline text-gray-700 dark:text-gray-300">
              用户
            </span>
          </Button>
        </Dropdown>
      </Space>

      {/* 设置模态框 */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </Header>
  )
}

export default Navbar
