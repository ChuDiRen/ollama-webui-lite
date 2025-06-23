import React from 'react'
import { Select, Typography, Space, Tag, Button, message } from 'antd'
import { RobotOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
import type { Model } from '@/contexts/AppContext'

const { Text } = Typography
const { Option } = Select

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onModelChange: (model: string) => void
  disabled?: boolean
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
}) => {
  // 格式化模型大小
  const formatModelSize = (size?: number) => {
    if (!size) return ''
    
    const gb = size / (1024 * 1024 * 1024)
    if (gb >= 1) {
      return `${gb.toFixed(1)}GB`
    }
    
    const mb = size / (1024 * 1024)
    return `${mb.toFixed(0)}MB`
  }

  // 获取模型类型标签颜色
  const getModelTypeColor = (family?: string) => {
    switch (family?.toLowerCase()) {
      case 'llama':
        return 'blue'
      case 'mistral':
        return 'purple'
      case 'gemma':
        return 'green'
      case 'qwen':
        return 'orange'
      case 'codellama':
        return 'cyan'
      default:
        return 'default'
    }
  }

  // 设为默认模型
  const handleSetDefault = (modelName: string) => {
    localStorage.setItem('defaultModel', modelName)
    message.success('默认模型已更新')
  }

  // 获取默认模型
  const getDefaultModel = () => {
    return localStorage.getItem('defaultModel')
  }

  const defaultModel = getDefaultModel()

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center space-x-2">
        <RobotOutlined className="text-blue-500" />
        <Text className="font-medium text-gray-900 dark:text-gray-100">
          选择模型
        </Text>
      </div>

      {/* 模型选择器 */}
      <Select
        value={selectedModel}
        onChange={onModelChange}
        disabled={disabled}
        placeholder="请选择一个模型"
        className="w-full"
        size="large"
        showSearch
        filterOption={(input, option) =>
          (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
        }
        popupRender={(menu) => (
          <div>
            {menu}
            {models.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Text>未找到可用模型</Text>
                <br />
                <Text className="text-xs">
                  请确保 Ollama 已启动并安装了模型
                </Text>
              </div>
            )}
          </div>
        )}
      >
        {models.map((model) => (
          <Option key={model.name} value={model.name}>
            <div className="flex items-center justify-between py-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Text className="font-medium truncate">
                    {model.name}
                  </Text>
                  {defaultModel === model.name && (
                    <StarFilled className="text-yellow-500 text-xs" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  {model.details?.family && (
                    <Tag 
                      size="small" 
                      color={getModelTypeColor(model.details.family)}
                    >
                      {model.details.family}
                    </Tag>
                  )}
                  
                  {model.details?.parameter_size && (
                    <Tag size="small" color="default">
                      {model.details.parameter_size}
                    </Tag>
                  )}
                  
                  {model.size && (
                    <Text className="text-xs text-gray-500">
                      {formatModelSize(model.size)}
                    </Text>
                  )}
                </div>
              </div>
            </div>
          </Option>
        ))}
      </Select>

      {/* 选中模型的详细信息 */}
      {selectedModel && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {(() => {
            const model = models.find(m => m.name === selectedModel)
            if (!model) return null

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Text className="font-medium text-gray-900 dark:text-gray-100">
                    {model.name}
                  </Text>
                  
                  {defaultModel !== model.name && (
                    <Button
                      type="link"
                      size="small"
                      icon={<StarOutlined />}
                      onClick={() => handleSetDefault(model.name)}
                      className="text-gray-500 hover:text-yellow-500"
                    >
                      设为默认
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {model.details?.family && (
                    <div>
                      <Text className="text-gray-500 dark:text-gray-400">模型系列:</Text>
                      <br />
                      <Tag color={getModelTypeColor(model.details.family)}>
                        {model.details.family}
                      </Tag>
                    </div>
                  )}

                  {model.details?.parameter_size && (
                    <div>
                      <Text className="text-gray-500 dark:text-gray-400">参数规模:</Text>
                      <br />
                      <Text className="font-medium">
                        {model.details.parameter_size}
                      </Text>
                    </div>
                  )}

                  {model.size && (
                    <div>
                      <Text className="text-gray-500 dark:text-gray-400">模型大小:</Text>
                      <br />
                      <Text className="font-medium">
                        {formatModelSize(model.size)}
                      </Text>
                    </div>
                  )}

                  {model.details?.quantization_level && (
                    <div>
                      <Text className="text-gray-500 dark:text-gray-400">量化级别:</Text>
                      <br />
                      <Text className="font-medium">
                        {model.details.quantization_level}
                      </Text>
                    </div>
                  )}
                </div>

                {model.details?.format && (
                  <div>
                    <Text className="text-gray-500 dark:text-gray-400">格式:</Text>
                    <Text className="ml-2 font-medium">
                      {model.details.format}
                    </Text>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* 提示信息 */}
      {models.length === 0 && (
        <div className="text-center py-8">
          <RobotOutlined className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
          <Text className="text-gray-500 dark:text-gray-400">
            未检测到可用模型
          </Text>
          <br />
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            请使用 <code>ollama pull &lt;model-name&gt;</code> 下载模型
          </Text>
        </div>
      )}
    </div>
  )
}

export default ModelSelector
