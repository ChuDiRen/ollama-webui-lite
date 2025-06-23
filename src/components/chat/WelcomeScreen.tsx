import React from 'react'
import { Typography, Card, Space, Button } from 'antd'
import { 
  MessageOutlined, 
  BulbOutlined, 
  CodeOutlined, 
  BookOutlined,
  RocketOutlined 
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage }) => {
  // 预设问题示例
  const exampleQuestions = [
    {
      icon: <BulbOutlined className="text-yellow-500" />,
      title: '创意写作',
      description: '帮我写一个关于未来科技的短故事',
      prompt: '请帮我写一个关于未来科技的短故事，大约300字左右。',
    },
    {
      icon: <CodeOutlined className="text-blue-500" />,
      title: '编程助手',
      description: '用Python实现一个简单的计算器',
      prompt: '请用Python帮我实现一个简单的计算器，支持基本的加减乘除运算。',
    },
    {
      icon: <BookOutlined className="text-green-500" />,
      title: '学习辅导',
      description: '解释一下机器学习的基本概念',
      prompt: '请用通俗易懂的语言解释一下机器学习的基本概念和应用场景。',
    },
    {
      icon: <RocketOutlined className="text-purple-500" />,
      title: '工作效率',
      description: '制定一个高效的工作计划',
      prompt: '请帮我制定一个提高工作效率的日程安排和时间管理建议。',
    },
  ]

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* 欢迎标题 */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <img 
                src="/ollama.png" 
                alt="Ollama" 
                className="w-12 h-12"
              />
            </div>
          </div>
          
          <Title level={1} className="!mb-4 text-gradient">
            欢迎使用 Ollama WebUI
          </Title>
          
          <Paragraph className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            这是一个基于 Ollama 的本地大语言模型聊天界面。
            您可以与AI助手进行对话，获得各种帮助和支持。
          </Paragraph>
        </div>

        {/* 功能特性 */}
        <div className="mb-12">
          <Title level={3} className="text-center mb-8">
            今天我可以为您做些什么？
          </Title>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exampleQuestions.map((item, index) => (
              <Card
                key={index}
                hoverable
                className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => onSendMessage(item.prompt)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-2xl">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <Title level={5} className="!mb-2">
                      {item.title}
                    </Title>
                    <Text className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="text-center">
          <Card className="bg-gray-50 dark:bg-gray-800 border-0">
            <Space direction="vertical" size="middle" className="w-full">
              <div className="flex items-center justify-center space-x-2">
                <MessageOutlined className="text-blue-500" />
                <Text className="font-medium">使用提示</Text>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Text className="text-gray-600 dark:text-gray-300">
                    💬 支持多轮对话
                  </Text>
                </div>
                <div className="text-center">
                  <Text className="text-gray-600 dark:text-gray-300">
                    🎨 Markdown 渲染
                  </Text>
                </div>
                <div className="text-center">
                  <Text className="text-gray-600 dark:text-gray-300">
                    ⚡ 实时流式响应
                  </Text>
                </div>
              </div>
              
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                点击上方示例开始对话，或在下方输入框中输入您的问题
              </Text>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
