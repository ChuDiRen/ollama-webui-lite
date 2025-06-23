import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'

import AppLayout from './components/layout/AppLayout'
import ChatPage from './pages/ChatPage'
import { AppProvider } from './contexts/AppContext'
import { ThemeProvider } from './contexts/ThemeContext'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <Layout className="min-h-screen">
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<ChatPage />} />
              <Route path="c/:id" element={<ChatPage />} />
            </Route>
          </Routes>
        </Layout>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
