# Ollama WebUI Lite 🦙

一个现代化的 Ollama 网页界面，基于 React + TypeScript + Ant Design X 构建，提供优雅的 AI 对话体验。

## ✨ 特性

### 🎨 现代化设计
- **企业级 UI** - 基于 Ant Design X 的专业界面设计
- **响应式布局** - 完美适配桌面端和移动端
- **深色/浅色主题** - 支持主题切换，保护视力
- **流畅动画** - 300ms 标准过渡动画，提升用户体验

### 💬 智能对话
- **实时流式对话** - 支持 Ollama 和 DeepSeek API
- **Markdown 渲染** - 完整支持代码高亮和数学公式
- **消息管理** - 编辑、重新生成、复制消息
- **对话历史** - 自动保存，支持导入导出

### 🔧 强大功能
- **模型管理** - 查看和选择可用模型
- **高级设置** - 温度、Top-K、Top-P 等参数调节
- **本地存储** - IndexedDB 数据持久化
- **多语言支持** - 完整中文本地化

### 🚀 技术亮点
- **React 18** - 最新 React 特性和性能优化
- **TypeScript** - 完整类型安全，提升开发体验
- **Vite** - 极速开发构建，热重载支持
- **现代架构** - 模块化设计，易于维护和扩展

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **UI 组件库**: Ant Design X + Ant Design 5.22.2
- **构建工具**: Vite 5.4.19
- **样式方案**: Tailwind CSS 3.4.13
- **路由管理**: React Router DOM v6
- **状态管理**: React Context + useReducer
- **数据存储**: IndexedDB (idb)
- **代码规范**: ESLint + Prettier

## 📦 安装使用

### 环境要求

- **Node.js** 16+
- **npm** 8+
- **Ollama** 服务运行在 `localhost:11434` (可选)
- **DeepSeek API Key** (可选)

### 快速开始

1. **克隆项目**
   ```bash
   git clone https://github.com/ollama-webui/ollama-webui-lite.git
   cd ollama-webui-lite
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**

   打开浏览器访问 `http://localhost:3000`

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 代码质量

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

## ⚙️ 配置说明

### API 提供商配置

应用支持两种 API 提供商：

#### 1. Ollama (本地部署)
- 下载并安装 [Ollama](https://ollama.ai/)
- 启动 Ollama 服务：`ollama serve`
- 默认运行在 `http://localhost:11434`

#### 2. DeepSeek (云端 API)
- 注册 [DeepSeek](https://platform.deepseek.com/) 账号
- 获取 API Key
- 在设置中配置 API Key

### 环境变量

创建 `.env.local` 文件：

```env
# DeepSeek API Key (可选)
VITE_DEEPSEEK_API_KEY=your_api_key_here

# Ollama API 地址 (可选，默认 localhost:11434)
VITE_OLLAMA_API_URL=http://localhost:11434/api
```

## 📁 项目结构

```
src/
├── components/          # 组件库
│   ├── chat/           # 聊天相关组件
│   │   ├── ChatInterface.tsx      # 聊天界面
│   │   ├── MessageBubble.tsx      # 消息气泡
│   │   ├── MessageInput.tsx       # 消息输入
│   │   ├── ModelSelector.tsx      # 模型选择器
│   │   ├── WelcomeScreen.tsx      # 欢迎页面
│   │   └── TypingIndicator.tsx    # 打字指示器
│   ├── common/         # 通用组件
│   │   ├── OllamaInstallGuide.tsx # 安装指南
│   │   ├── SettingsModal.tsx      # 设置模态框
│   │   └── WelcomeSetup.tsx       # 欢迎设置
│   └── layout/         # 布局组件
│       ├── AppLayout.tsx          # 应用布局
│       ├── Navbar.tsx             # 导航栏
│       └── Sidebar.tsx            # 侧边栏
├── contexts/           # 状态管理
│   ├── AppContext.tsx             # 应用状态
│   └── ThemeContext.tsx           # 主题状态
├── pages/              # 页面组件
│   └── ChatPage.tsx               # 聊天页面
├── services/           # API 服务
│   ├── api.ts                     # 基础 API
│   ├── apiManager.ts              # API 管理器
│   └── deepseekApi.ts             # DeepSeek API
├── utils/              # 工具函数
│   └── index.ts                   # 通用工具
├── constants/          # 常量定义
│   └── index.ts                   # 应用常量
├── App.tsx            # 主应用组件
├── main.tsx           # 应用入口
└── index.css          # 全局样式
```

## 🎯 使用指南

### 基本使用

1. **选择 API 提供商** - 在设置中选择 Ollama 或 DeepSeek
2. **配置连接** - 设置 API 地址或 API Key
3. **选择模型** - 从可用模型列表中选择
4. **开始对话** - 输入消息开始与 AI 对话

### 高级功能

- **消息编辑** - 点击消息旁的编辑按钮
- **重新生成** - 对 AI 回复不满意时重新生成
- **复制消息** - 快速复制消息内容
- **导出对话** - 将对话导出为 JSON 文件
- **导入对话** - 从文件导入历史对话

## 🔧 开发指南

### 添加新组件

```typescript
// src/components/example/NewComponent.tsx
import React from 'react'
import { Button } from 'antd'

interface NewComponentProps {
  title: string
  onClick: () => void
}

const NewComponent: React.FC<NewComponentProps> = ({ title, onClick }) => {
  return (
    <Button onClick={onClick} className="rounded-lg">
      {title}
    </Button>
  )
}

export default NewComponent
```

### 状态管理

```typescript
// 使用 AppContext
import { useApp } from '@/contexts/AppContext'

const MyComponent = () => {
  const { state, dispatch } = useApp()

  const handleAction = () => {
    dispatch({ type: 'SET_LOADING', payload: true })
  }

  return <div>{state.isLoading ? '加载中...' : '已完成'}</div>
}
```

### API 调用

```typescript
// 使用 API 管理器
import { apiManager } from '@/services/apiManager'

const sendMessage = async (message: string) => {
  try {
    await apiManager.chatStream(
      messages,
      selectedModel,
      settings,
      (chunk) => {
        // 处理流式响应
        console.log(chunk.content)
      }
    )
  } catch (error) {
    console.error('发送失败:', error)
  }
}
```

## 🚀 部署

### Docker 部署

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 设置构建命令：`npm run build`
3. 设置输出目录：`build`
4. 部署完成

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 提交 Issue

- 使用清晰的标题描述问题
- 提供详细的重现步骤
- 包含错误截图或日志

### 提交 Pull Request

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### 开发规范

- 遵循 ESLint 和 Prettier 规则
- 编写 TypeScript 类型定义
- 添加必要的注释和文档
- 确保代码通过所有检查

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Ollama](https://ollama.ai/) - 提供本地 LLM 运行环境
- [Ant Design](https://ant.design/) - 优秀的 React UI 组件库
- [React](https://reactjs.org/) - 强大的前端框架
- [Vite](https://vitejs.dev/) - 快速的构建工具

---

**让 AI 对话更简单、更优雅！** 🚀
