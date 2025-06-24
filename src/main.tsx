import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntdApp, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import App from './App'
import './index.css'

// 设置dayjs为中文
dayjs.locale('zh-cn')

// Ant Design主题配置
const getTheme = (isDark: boolean) => ({
  algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: '#0ea5e9',
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    colorBgBase: isDark ? '#141414' : '#ffffff',
    colorTextBase: isDark ? '#ffffff' : '#000000',
  },
  components: {
    Layout: {
      headerBg: isDark ? '#141414' : '#ffffff',
      siderBg: isDark ? '#1f1f1f' : '#fafafa',
      bodyBg: isDark ? '#141414' : '#ffffff',
    },
    Button: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
    },
    Message: {
      contentBg: isDark ? '#262626' : '#ffffff',
    },
    Modal: {
      contentBg: isDark ? '#1f1f1f' : '#ffffff',
      headerBg: isDark ? '#1f1f1f' : '#ffffff',
    },
  },
})

// 主应用组件
const AppWrapper: React.FC = () => {
  const [isDark, setIsDark] = React.useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  React.useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // 监听主题变化事件
  React.useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail as string
      setIsDark(newTheme === 'dark')
    }

    window.addEventListener('themeChange', handleThemeChange as EventListener)
    return () =>
      window.removeEventListener(
        'themeChange',
        handleThemeChange as EventListener
      )
  }, [])

  return (
    <ConfigProvider locale={zhCN} theme={getTheme(isDark)}>
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppWrapper />
    </BrowserRouter>
  </React.StrictMode>
)
