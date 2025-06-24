import React, { useState, useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { Layout, App } from 'antd'
import { useApp } from '@/contexts/AppContext'
import { useTheme } from '@/contexts/ThemeContext'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import OllamaInstallGuide from '@/components/common/OllamaInstallGuide'
import WelcomeSetup from '@/components/common/WelcomeSetup'
import SettingsModal from '@/components/common/SettingsModal'
import { apiManager } from '@/services/apiManager'

const { Content, Sider } = Layout

const AppLayout: React.FC = () => {
  const { state, dispatch } = useApp()
  const { theme } = useTheme()
  // const navigate = useNavigate()
  const { id } = useParams()
  const { message } = App.useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [siderWidth, setSiderWidth] = useState(280)
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  // 检查是否需要显示欢迎页面
  useEffect(() => {
    const provider = state.settings.apiProvider || 'ollama'
    const hasOllamaConfig = state.settings.API_BASE_URL
    const hasDeepSeekConfig = state.settings.DEEPSEEK_API_KEY

    const needsSetup =
      (provider === 'ollama' && !hasOllamaConfig) ||
      (provider === 'deepseek' && !hasDeepSeekConfig)

    setShowWelcome(needsSetup)
  }, [state.settings])

  // 检查API服务状态
  useEffect(() => {
    const checkAPIStatus = async () => {
      // 如果没有配置任何API，跳过检查
      const provider = state.settings.apiProvider || 'ollama'
      const hasOllamaConfig = state.settings.API_BASE_URL
      const hasDeepSeekConfig = state.settings.DEEPSEEK_API_KEY

      if (provider === 'ollama' && !hasOllamaConfig) {
        console.log('Ollama URL not configured, skipping check')
        return
      }

      if (provider === 'deepseek' && !hasDeepSeekConfig) {
        console.log('DeepSeek API Key not configured, skipping check')
        return
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })

        // 设置 API 管理器配置
        apiManager.setProvider(provider)

        if (state.settings.API_BASE_URL) {
          apiManager.setOllamaBaseURL(state.settings.API_BASE_URL)
        }

        if (state.settings.DEEPSEEK_API_KEY) {
          apiManager.setDeepSeekApiKey(state.settings.DEEPSEEK_API_KEY)
        }

        // 检查服务状态
        const isConnected = await apiManager.checkStatus()

        if (isConnected) {
          const models = await apiManager.getModels()
          dispatch({ type: 'SET_MODELS', payload: models })
          console.log(`Successfully connected to ${provider}`)
        } else {
          throw new Error('API服务不可用')
        }
      } catch (error) {
        console.error('Failed to connect to API service:', error)
        const serviceName = provider === 'ollama' ? 'Ollama' : 'DeepSeek'

        // 只在有配置的情况下显示错误
        if (
          (provider === 'ollama' && hasOllamaConfig) ||
          (provider === 'deepseek' && hasDeepSeekConfig)
        ) {
          message.error({
            content: (
              <div>
                无法连接到{serviceName}服务
                <br />
                {provider === 'ollama' && (
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault()
                      setShowInstallGuide(true)
                    }}
                    style={{ color: '#1890ff' }}
                  >
                    点击这里获取安装帮助
                  </a>
                )}
                {provider === 'deepseek' && (
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    请检查API Key是否正确
                  </span>
                )}
              </div>
            ),
            duration: 5,
          })
        }

        dispatch({ type: 'SET_ERROR', payload: `无法连接到${serviceName}服务` })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    // 延迟检查，避免页面加载时立即显示错误
    const timer = setTimeout(checkAPIStatus, 1000)
    return () => clearTimeout(timer)
  }, [
    state.settings.API_BASE_URL,
    state.settings.DEEPSEEK_API_KEY,
    state.settings.apiProvider,
    dispatch,
    message,
  ])

  // 设置当前聊天ID
  useEffect(() => {
    if (id && id !== state.currentChatId) {
      dispatch({ type: 'SET_CURRENT_CHAT', payload: id })
    } else if (!id && state.currentChatId) {
      dispatch({ type: 'SET_CURRENT_CHAT', payload: null })
    }
  }, [id, state.currentChatId, dispatch])

  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
        setSiderWidth(0)
      } else {
        setCollapsed(false)
        setSiderWidth(280)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 如果需要显示欢迎页面
  if (showWelcome) {
    return (
      <Layout className="min-h-screen">
        <WelcomeSetup onOpenSettings={() => setShowSettings(true)} />

        {/* 设置模态框 */}
        <SettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </Layout>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        width={siderWidth}
        collapsed={collapsed}
        collapsedWidth={0}
        trigger={null}
        className={`
          fixed left-0 top-0 h-full z-40 transition-all duration-300
          ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
          border-r border-gray-200 dark:border-gray-700
        `}
        style={{
          boxShadow: collapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </Sider>

      <Layout
        className="transition-all duration-300"
        style={{
          marginLeft: collapsed ? 0 : siderWidth,
        }}
      >
        <Navbar
          collapsed={collapsed}
          onToggleSider={() => setCollapsed(!collapsed)}
        />

        <Content className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* 移动端遮罩 */}
      {!collapsed && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Ollama 安装指南 */}
      <OllamaInstallGuide
        open={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
      />
    </Layout>
  )
}

export default AppLayout
