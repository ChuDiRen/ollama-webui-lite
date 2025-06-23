import React from 'react'
import { Form, InputNumber, Input, Switch, Typography, Tooltip, Space } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

const { Text } = Typography
const { TextArea } = Input

interface AdvancedSettingsProps {
  form: any
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      {/* 种子 */}
      <Form.Item
        label={
          <Space>
            种子
            <Tooltip title="设置随机种子以获得可重现的结果。留空表示使用随机种子。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="seed"
      >
        <InputNumber
          placeholder="输入种子"
          style={{ width: '100%' }}
          min={0}
          max={2147483647}
        />
      </Form.Item>

      {/* 温度 */}
      <Form.Item
        label={
          <Space>
            温度
            <Tooltip title="控制输出的随机性。较低的值使输出更确定，较高的值使输出更随机。范围: 0.0-2.0">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="temperature"
      >
        <InputNumber
          placeholder="输入温度 (0.0 - 2.0)"
          style={{ width: '100%' }}
          min={0}
          max={2}
          step={0.1}
        />
      </Form.Item>

      {/* 重复惩罚 */}
      <Form.Item
        label={
          <Space>
            重复惩罚
            <Tooltip title="控制模型重复相同内容的倾向。较高的值减少重复。范围: 0.0-2.0">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="repeat_penalty"
      >
        <InputNumber
          placeholder="输入重复惩罚"
          style={{ width: '100%' }}
          min={0}
          max={2}
          step={0.1}
        />
      </Form.Item>

      {/* 重复最后N个 */}
      <Form.Item
        label={
          <Space>
            重复最后N个
            <Tooltip title="在应用重复惩罚时考虑的最后N个token数量。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="repeat_last_n"
      >
        <InputNumber
          placeholder="输入重复最后N个"
          style={{ width: '100%' }}
          min={-1}
          max={2048}
        />
      </Form.Item>

      {/* Top K */}
      <Form.Item
        label={
          <Space>
            Top K
            <Tooltip title="限制下一个token的候选数量。较低的值使输出更集中。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="top_k"
      >
        <InputNumber
          placeholder="输入 Top K"
          style={{ width: '100%' }}
          min={1}
          max={100}
        />
      </Form.Item>

      {/* Top P */}
      <Form.Item
        label={
          <Space>
            Top P
            <Tooltip title="核采样参数。只考虑累积概率达到P的token。范围: 0.0-1.0">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="top_p"
      >
        <InputNumber
          placeholder="输入 Top P (0.0 - 1.0)"
          style={{ width: '100%' }}
          min={0}
          max={1}
          step={0.1}
        />
      </Form.Item>

      {/* TFS Z */}
      <Form.Item
        label={
          <Space>
            TFS Z
            <Tooltip title="尾部自由采样参数。控制输出的多样性。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="tfs_z"
      >
        <InputNumber
          placeholder="输入 TFS Z"
          style={{ width: '100%' }}
          min={0}
          max={1}
          step={0.1}
        />
      </Form.Item>

      {/* Mirostat */}
      <Form.Item
        label={
          <Space>
            Mirostat
            <Tooltip title="启用Mirostat采样算法。0=禁用，1=Mirostat 1.0，2=Mirostat 2.0">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="mirostat"
      >
        <InputNumber
          placeholder="输入 Mirostat"
          style={{ width: '100%' }}
          min={0}
          max={2}
        />
      </Form.Item>

      {/* Mirostat Eta */}
      <Form.Item
        label={
          <Space>
            Mirostat Eta
            <Tooltip title="Mirostat学习率。影响算法对反馈的响应速度。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="mirostat_eta"
      >
        <InputNumber
          placeholder="输入 Mirostat Eta"
          style={{ width: '100%' }}
          min={0}
          max={1}
          step={0.1}
        />
      </Form.Item>

      {/* Mirostat Tau */}
      <Form.Item
        label={
          <Space>
            Mirostat Tau
            <Tooltip title="Mirostat目标熵。控制输出的一致性和创造性之间的平衡。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="mirostat_tau"
      >
        <InputNumber
          placeholder="输入 Mirostat Tau"
          style={{ width: '100%' }}
          min={0}
          max={10}
          step={0.1}
        />
      </Form.Item>

      {/* 上下文长度 */}
      <Form.Item
        label={
          <Space>
            上下文长度
            <Tooltip title="模型可以处理的最大token数量。较大的值允许更长的对话历史。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="num_ctx"
      >
        <InputNumber
          placeholder="输入上下文长度"
          style={{ width: '100%' }}
          min={1}
          max={32768}
        />
      </Form.Item>

      {/* 最大输出长度 */}
      <Form.Item
        label={
          <Space>
            最大输出长度
            <Tooltip title="模型生成的最大token数量。适用于DeepSeek等云端API。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="max_tokens"
      >
        <InputNumber
          placeholder="输入最大输出长度"
          style={{ width: '100%' }}
          min={1}
          max={8192}
        />
      </Form.Item>

      {/* 停止序列 */}
      <Form.Item
        label={
          <Space>
            停止序列
            <Tooltip title="当模型生成这些序列时停止生成。每行一个序列。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="stop"
      >
        <TextArea
          placeholder="输入停止序列，每行一个"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>

      {/* 低内存模式 */}
      <Form.Item
        label={
          <Space>
            低内存模式
            <Tooltip title="启用低内存模式以减少内存使用，但可能影响性能。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="low_vram"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* F16 KV */}
      <Form.Item
        label={
          <Space>
            F16 KV
            <Tooltip title="使用半精度浮点数存储键值缓存，减少内存使用。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="f16_kv"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* 使用MLock */}
      <Form.Item
        label={
          <Space>
            使用 MLock
            <Tooltip title="锁定模型在内存中，防止被交换到磁盘。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="use_mlock"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* 使用MMap */}
      <Form.Item
        label={
          <Space>
            使用 MMap
            <Tooltip title="使用内存映射加载模型，可以减少内存使用。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="use_mmap"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* 线程数 */}
      <Form.Item
        label={
          <Space>
            线程数
            <Tooltip title="用于计算的线程数。通常设置为CPU核心数。">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        name="num_thread"
      >
        <InputNumber
          placeholder="输入线程数"
          style={{ width: '100%' }}
          min={1}
          max={64}
        />
      </Form.Item>
    </div>
  )
}

export default AdvancedSettings
