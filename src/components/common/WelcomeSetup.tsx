import React, { useState } from 'react'
import { Card, Button, Typography, Space, Steps, Alert } from 'antd'
import { 
  SettingOutlined, 
  CloudOutlined, 
  DesktopOutlined,
  RocketOutlined 
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface WelcomeSetupProps {
  onOpenSettings: () => void
}

const WelcomeSetup: React.FC<WelcomeSetupProps> = ({ onOpenSettings }) => {
  const [selectedProvider, setSelectedProvider] = useState<'ollama' | 'deepseek' | null>(null)

  const providers = [
    {
      key: 'ollama',
      title: 'Ollama (本地)',
      icon: <DesktopOutlined className="text-4xl text-blue-500" />,
      description: '在本地运行大语言模型，完全私密，无需联网',
      features: [
        '完全本地化，保护隐私',
        '无需API费用',
        '支持多种开源模型',
        '可离线使用'
      ],
      requirements: '需要安装 Ollama 软件',
    },
    {
      key: 'deepseek',
      title: 'DeepSeek (云端)',
      icon: <CloudOutlined className="text-4xl text-green-500" />,
      description: '使用 DeepSeek 云端API，快速开始使用',
      features: [
        '即开即用，无需安装',
        '强大的模型性能',
        '稳定的服务质量',
        '持续更新优化'
      ],
      requirements: '需要 DeepSeek API Key',
    },
  ]

  const setupSteps = [
    {
      title: '选择API提供商',
      description: '选择 Ollama 或 DeepSeek',
    },
    {
      title: '配置参数',
      description: '设置API地址或密钥',
    },
    {
      title: '开始对话',
      description: '选择模型并开始聊天',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl w-full">
        {/* 欢迎标题 */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <RocketOutlined className="text-white text-3xl" />
          </div>
          
          <Title level={1} className="!mb-4 text-gradient">
            欢迎使用 Ollama WebUI Lite
          </Title>
          
          <Paragraph className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            开始之前，请选择您要使用的AI服务提供商
          </Paragraph>
        </div>

        {/* 设置步骤 */}
        <div className="mb-12">
          <Steps
            current={0}
            items={setupSteps}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* 提供商选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {providers.map((provider) => (
            <Card
              key={provider.key}
              hoverable
              className={`
                transition-all duration-300 cursor-pointer
                ${selectedProvider === provider.key 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-lg'
                }
              `}
              onClick={() => setSelectedProvider(provider.key as 'ollama' | 'deepseek')}
            >
              <div className="text-center mb-6">
                {provider.icon}
                <Title level={3} className="!mt-4 !mb-2">
                  {provider.title}
                </Title>
                <Text className="text-gray-600 dark:text-gray-300">
                  {provider.description}
                </Text>
              </div>

              <div className="space-y-3 mb-6">
                {provider.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <Text className="text-sm">{feature}</Text>
                  </div>
                ))}
              </div>

              <Alert
                message={provider.requirements}
                type="info"
                showIcon
                className="text-sm"
              />
            </Card>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="text-center space-y-4">
          <Button
            type="primary"
            size="large"
            icon={<SettingOutlined />}
            onClick={onOpenSettings}
            className="px-8 h-12 text-lg"
          >
            开始配置
          </Button>
          
          <div>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              您可以随时在设置中切换不同的API提供商
            </Text>
          </div>
        </div>

        {/* 帮助信息 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card size="small" title="🚀 Ollama 快速开始">
            <div className="space-y-2 text-sm">
              <div>1. 下载并安装 Ollama</div>
              <div>2. 运行 <code>ollama pull llama2</code></div>
              <div>3. 在设置中配置服务器地址</div>
              <div>4. 开始对话</div>
            </div>
          </Card>

          <Card size="small" title="☁️ DeepSeek 快速开始">
            <div className="space-y-2 text-sm">
              <div>1. 访问 DeepSeek 官网注册</div>
              <div>2. 获取 API Key</div>
              <div>3. 在设置中输入 API Key</div>
              <div>4. 开始对话</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WelcomeSetup
