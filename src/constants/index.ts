// API相关常量
export const OLLAMA_API_BASE_URL = 'http://localhost:11434/api'

// 应用信息
export const APP_NAME = 'Ollama 网页界面'
export const APP_VERSION = '1.0.0'

// 默认设置
export const DEFAULT_SETTINGS = {
  API_BASE_URL: OLLAMA_API_BASE_URL,
  temperature: 0.8,
  seed: undefined,
  repeat_penalty: 1.1,
  top_k: 40,
  top_p: 0.9,
  num_ctx: 2048,
  requestFormat: undefined,
  options: {},
}

// 消息相关
export const MAX_MESSAGE_LENGTH = 4000
export const TYPING_DELAY = 50

// 本地存储键名
export const STORAGE_KEYS = {
  THEME: 'theme',
  SETTINGS: 'settings',
  LAST_CHAT_ID: 'lastChatId',
} as const

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  API_ERROR: 'API调用失败，请检查服务器状态',
  INVALID_MODEL: '无效的模型选择',
  EMPTY_MESSAGE: '消息不能为空',
  DB_ERROR: '数据库操作失败',
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  CHAT_SAVED: '对话已保存',
  SETTINGS_SAVED: '设置已保存',
  MODEL_UPDATED: '模型已更新',
  COPIED: '已复制到剪贴板',
} as const

// 路由路径
export const ROUTES = {
  HOME: '/',
  CHAT: '/c/:id',
} as const

// 动画持续时间
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const
