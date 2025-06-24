import React, { useState, useEffect } from 'react'
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Divider,
  Card,
  Progress,
  message,
  Popconfirm,
} from 'antd'
import {
  SettingOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ApiOutlined,
} from '@ant-design/icons'
import { useApp } from '@/contexts/AppContext'
import { useTheme } from '@/contexts/ThemeContext'
import { apiManager } from '@/services/apiManager'
import { APP_NAME } from '@/constants'
import AdvancedSettings from '@/components/chat/AdvancedSettings'

const { Title, Text } = Typography
const { Option } = Select

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { state, dispatch } = useApp()
  const { theme, setTheme } = useTheme()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('general')
  const [isConnecting, setIsConnecting] = useState(false)
  const [pullProgress, setPullProgress] = useState<{ completed?: number; total?: number; status?: string } | null>(null)
  const [isPulling, setIsPulling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 表单初始值
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        apiProvider: state.settings.apiProvider,
        API_BASE_URL: state.settings.API_BASE_URL,
        DEEPSEEK_API_KEY: state.settings.DEEPSEEK_API_KEY,
        temperature: state.settings.temperature,
        seed: state.settings.seed,
        repeat_penalty: state.settings.repeat_penalty,
        top_k: state.settings.top_k,
        top_p: state.settings.top_p,
        num_ctx: state.settings.num_ctx,
        max_tokens: state.settings.max_tokens,
        requestFormat: state.settings.requestFormat,
      })
    }
  }, [open, state.settings, form])

  // 测试连接
  const handleTestConnection = async () => {
    const values = form.getFieldsValue()
    setIsConnecting(true)

    try {
      // 设置 API 配置
      if (values.apiProvider) {
        apiManager.setProvider(values.apiProvider)
      }

      if (values.API_BASE_URL) {
        apiManager.setOllamaBaseURL(values.API_BASE_URL)
      }

      if (values.DEEPSEEK_API_KEY) {
        apiManager.setDeepSeekApiKey(values.DEEPSEEK_API_KEY)
      }

      const isConnected = await apiManager.checkStatus()

      if (isConnected) {
        const models = await apiManager.getModels()
        dispatch({ type: 'SET_MODELS', payload: models })
        const serviceName =
          values.apiProvider === 'deepseek' ? 'DeepSeek' : 'Ollama'
        message.success(`${serviceName} 服务器连接验证成功`)
      } else {
        throw new Error('连接失败')
      }
    } catch (error) {
      const serviceName =
        values.apiProvider === 'deepseek' ? 'DeepSeek' : 'Ollama'
      message.error(`无法连接到 ${serviceName} 服务器。请检查配置和服务状态。`)
    } finally {
      setIsConnecting(false)
    }
  }

  // 保存设置
  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      // 更新设置
      dispatch({ type: 'SET_SETTINGS', payload: values })

      // 保存到数据库
      if (state.db) {
        for (const [key, value] of Object.entries(values)) {
          await state.db.put('settings', { key, value })
        }
      }

      message.success('设置已保存')
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  // 拉取模型
  const handlePullModel = async (modelName: string) => {
    if (!modelName.trim()) {
      message.error('请输入模型名称')
      return
    }

    setIsPulling(true)
    setPullProgress(null)

    try {
      await apiManager.pullModel(modelName, progress => {
        setPullProgress(progress)
      })

      // 重新获取模型列表
      const models = await apiManager.getModels()
      dispatch({ type: 'SET_MODELS', payload: models })

      message.success(`模型 ${modelName} 拉取成功`)
      setPullProgress(null)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      message.error(`拉取模型失败: ${errorMessage}`)
    } finally {
      setIsPulling(false)
    }
  }

  // 删除模型
  const handleDeleteModel = async (modelName: string) => {
    setIsDeleting(true)

    try {
      await apiManager.deleteModel(modelName)

      // 重新获取模型列表
      const models = await apiManager.getModels()
      dispatch({ type: 'SET_MODELS', payload: models })

      message.success(`模型 ${modelName} 删除成功`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      message.error(`删除模型失败: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const tabItems = [
    {
      key: 'general',
      label: '常规',
      children: (
        <div className="space-y-6">
          <Form.Item
            label="API 提供商"
            name="apiProvider"
            rules={[{ required: true, message: '请选择API提供商' }]}
          >
            <Select placeholder="选择API提供商">
              <Option value="ollama">Ollama (本地)</Option>
              <Option value="deepseek">DeepSeek (云端)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.apiProvider !== currentValues.apiProvider
            }
          >
            {({ getFieldValue }) => {
              const apiProvider = getFieldValue('apiProvider')

              if (apiProvider === 'ollama') {
                return (
                  <Form.Item
                    label="Ollama 服务器 URL"
                    name="API_BASE_URL"
                    rules={[{ required: true, message: '请输入服务器URL' }]}
                  >
                    <Input
                      placeholder="输入 URL (例如: http://localhost:11434/api)"
                      suffix={
                        <Button
                          type="link"
                          icon={<ApiOutlined />}
                          loading={isConnecting}
                          onClick={handleTestConnection}
                          size="small"
                        >
                          测试
                        </Button>
                      }
                    />
                  </Form.Item>
                )
              }

              if (apiProvider === 'deepseek') {
                return (
                  <Form.Item
                    label="DeepSeek API Key"
                    name="DEEPSEEK_API_KEY"
                    rules={[{ required: true, message: '请输入API Key' }]}
                  >
                    <Input.Password
                      placeholder="输入 DeepSeek API Key"
                      suffix={
                        <Button
                          type="link"
                          icon={<ApiOutlined />}
                          loading={isConnecting}
                          onClick={handleTestConnection}
                          size="small"
                        >
                          测试
                        </Button>
                      }
                    />
                  </Form.Item>
                )
              }

              return null
            }}
          </Form.Item>

          <Form.Item label="主题">
            <Select
              value={theme}
              onChange={value => setTheme(value)}
              style={{ width: 120 }}
            >
              <Option value="light">浅色</Option>
              <Option value="dark">深色</Option>
            </Select>
          </Form.Item>

          <Divider />

          <div>
            <Text className="text-gray-500">
              需要帮助？
              <Button type="link" size="small">
                查看文档
              </Button>
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: 'advanced',
      label: '高级',
      children: (
        <div className="space-y-4">
          <Title level={5}>参数</Title>
          <AdvancedSettings form={form} />

          <Divider />

          <Form.Item label="请求格式" name="requestFormat">
            <Select placeholder="选择请求格式" allowClear>
              <Option value="json">JSON</Option>
            </Select>
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'models',
      label: '模型',
      children: (
        <div className="space-y-6">
          <Card title="拉取模型" size="small">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="输入模型名称 (例如: llama2)"
                onPressEnter={e => handlePullModel(e.currentTarget.value)}
              />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={isPulling}
                onClick={e => {
                  const input =
                    e.currentTarget.parentElement?.querySelector('input')
                  if (input) handlePullModel(input.value)
                }}
              >
                拉取
              </Button>
            </Space.Compact>

            {pullProgress && (
              <div className="mt-4">
                <Progress
                  percent={Math.round(
                    ((pullProgress.completed || 0) /
                      (pullProgress.total || 1)) *
                      100
                  )}
                  status={
                    pullProgress.status === 'success' ? 'success' : 'active'
                  }
                />
                <Text className="text-sm text-gray-500">
                  {pullProgress.status || '下载中...'}
                </Text>
              </div>
            )}
          </Card>

          <Card title="已安装的模型" size="small">
            <div className="space-y-2">
              {state.models.map(model => (
                <div
                  key={model.name}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <Text strong>{model.name}</Text>
                    <br />
                    <Text className="text-sm text-gray-500">
                      {model.details?.parameter_size} •{' '}
                      {(model.size / 1024 / 1024 / 1024).toFixed(1)}GB
                    </Text>
                  </div>
                  <Popconfirm
                    title="确定要删除这个模型吗？"
                    onConfirm={() => handleDeleteModel(model.name)}
                    okText="删除"
                    cancelText="取消"
                    okType="danger"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={isDeleting}
                      size="small"
                    />
                  </Popconfirm>
                </div>
              ))}

              {state.models.length === 0 && (
                <Text className="text-gray-500">暂无已安装的模型</Text>
              )}
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'about',
      label: '关于',
      children: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <img src="/ollama.png" alt="Ollama" className="w-10 h-10" />
            </div>
            <Title level={4}>{APP_NAME}</Title>
            <Text className="text-gray-500">版本 1.0.0</Text>
          </div>

          <Divider />

          <div className="space-y-4">
            <div>
              <Text strong>Ollama 版本:</Text>
              <br />
              <Text>{state.info?.version || '未知'}</Text>
            </div>

            <div>
              <Text strong>创建者:</Text>
              <br />
              <Text>基于 Timothy J. Baek 的原始项目重构</Text>
            </div>

            <div>
              <Text strong>技术栈:</Text>
              <br />
              <Text>React + TypeScript + Ant Design X</Text>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          设置
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存
        </Button>,
      ]}
      width={800}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Form>
    </Modal>
  )
}

export default SettingsModal
