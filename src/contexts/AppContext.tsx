import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { openDB, IDBPDatabase } from 'idb'

// 类型定义
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  done?: boolean
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface Model {
  name: string
  size?: number
  digest?: string
  details?: {
    format?: string
    family?: string
    families?: string[]
    parameter_size?: string
    quantization_level?: string
  }
}

export interface Settings {
  // API 提供商设置
  apiProvider?: 'ollama' | 'deepseek'

  // Ollama 设置
  API_BASE_URL?: string

  // DeepSeek 设置
  DEEPSEEK_API_KEY?: string

  // 通用模型参数
  temperature?: number
  seed?: number
  repeat_penalty?: number
  top_k?: number
  top_p?: number
  num_ctx?: number
  max_tokens?: number
  requestFormat?: string
  options?: Record<string, any>
}

export interface AppState {
  chats: Chat[]
  currentChatId: string | null
  models: Model[]
  settings: Settings
  isLoading: boolean
  error: string | null
  db: IDBPDatabase | null
}

// Action类型
type AppAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_CURRENT_CHAT'; payload: string | null }
  | { type: 'SET_MODELS'; payload: Model[] }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DB'; payload: IDBPDatabase | null }

// 初始状态
const initialState: AppState = {
  chats: [],
  currentChatId: null,
  models: [],
  settings: {
    apiProvider: 'ollama',
    API_BASE_URL: 'http://localhost:11434/api',
    DEEPSEEK_API_KEY: '',
    temperature: 0.8,
    seed: undefined,
    repeat_penalty: 1.1,
    top_k: 40,
    top_p: 0.9,
    num_ctx: 2048,
    max_tokens: 4096,
  },
  isLoading: false,
  error: null,
  db: null,
}

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload }
    case 'ADD_CHAT':
      return { ...state, chats: [action.payload, ...state.chats] }
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id ? action.payload : chat
        ),
      }
    case 'DELETE_CHAT':
      return {
        ...state,
        chats: state.chats.filter(chat => chat.id !== action.payload),
        currentChatId:
          state.currentChatId === action.payload ? null : state.currentChatId,
      }
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChatId: action.payload }
    case 'SET_MODELS':
      return { ...state, models: action.payload }
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_DB':
      return { ...state, db: action.payload }
    default:
      return state
  }
}

// Context
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// Provider组件
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // 初始化数据库
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await openDB('ollama-webui', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('chats')) {
              db.createObjectStore('chats', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('settings')) {
              db.createObjectStore('settings', { keyPath: 'key' })
            }
          },
        })
        dispatch({ type: 'SET_DB', payload: db })

        // 加载聊天记录
        const chats = await db.getAll('chats')
        dispatch({ type: 'SET_CHATS', payload: chats.sort((a, b) => b.updatedAt - a.updatedAt) })

        // 加载设置
        const settingsData = await db.getAll('settings')
        const settings = settingsData.reduce((acc, item) => {
          acc[item.key] = item.value
          return acc
        }, {} as any)
        if (Object.keys(settings).length > 0) {
          dispatch({ type: 'SET_SETTINGS', payload: settings })
        }
      } catch (error) {
        console.error('Failed to initialize database:', error)
        dispatch({ type: 'SET_ERROR', payload: '数据库初始化失败' })
      }
    }

    initDB()
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
