import React from 'react'
import { Modal, Typography, Steps, Card, Space, Button, Alert } from 'antd'
import {
  DownloadOutlined,
  WindowsOutlined,
  AppleOutlined,
  CodeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface OllamaInstallGuideProps {
  open: boolean
  onClose: () => void
}

const OllamaInstallGuide: React.FC<OllamaInstallGuideProps> = ({
  open,
  onClose,
}) => {
  const getOS = () => {
    const userAgent = window.navigator.userAgent
    if (userAgent.includes('Windows')) return 'windows'
    if (userAgent.includes('Mac')) return 'mac'
    return 'linux'
  }

  const os = getOS()

  const installSteps = {
    windows: [
      {
        title: '下载 Ollama',
        description: '访问官网下载 Windows 版本',
        content: (
          <div>
            <Paragraph>
              1. 访问{' '}
              <a
                href="https://ollama.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ollama.ai
              </a>
            </Paragraph>
            <Paragraph>2. 点击 "Download for Windows" 按钮</Paragraph>
            <Paragraph>
              3. 下载 <code>OllamaSetup.exe</code> 文件
            </Paragraph>
          </div>
        ),
      },
      {
        title: '安装 Ollama',
        description: '运行安装程序',
        content: (
          <div>
            <Paragraph>
              1. 双击运行 <code>OllamaSetup.exe</code>
            </Paragraph>
            <Paragraph>2. 按照安装向导完成安装</Paragraph>
            <Paragraph>3. 安装完成后，Ollama 会自动启动</Paragraph>
          </div>
        ),
      },
      {
        title: '验证安装',
        description: '检查 Ollama 是否正常运行',
        content: (
          <div>
            <Paragraph>1. 打开命令提示符 (CMD) 或 PowerShell</Paragraph>
            <Paragraph>
              2. 运行命令: <code>ollama --version</code>
            </Paragraph>
            <Paragraph>3. 如果显示版本号，说明安装成功</Paragraph>
          </div>
        ),
      },
      {
        title: '下载模型',
        description: '下载你需要的AI模型',
        content: (
          <div>
            <Paragraph>运行以下命令下载模型：</Paragraph>
            <Paragraph>
              <code>ollama pull llama2</code> - 下载 Llama 2 模型
            </Paragraph>
            <Paragraph>
              <code>ollama pull mistral</code> - 下载 Mistral 模型
            </Paragraph>
            <Paragraph>
              <code>ollama pull codellama</code> - 下载 Code Llama 模型
            </Paragraph>
          </div>
        ),
      },
    ],
    mac: [
      {
        title: '下载 Ollama',
        description: '访问官网下载 macOS 版本',
        content: (
          <div>
            <Paragraph>
              1. 访问{' '}
              <a
                href="https://ollama.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ollama.ai
              </a>
            </Paragraph>
            <Paragraph>2. 点击 "Download for Mac" 按钮</Paragraph>
            <Paragraph>
              3. 下载 <code>Ollama-darwin.zip</code> 文件
            </Paragraph>
          </div>
        ),
      },
      {
        title: '安装 Ollama',
        description: '解压并安装应用程序',
        content: (
          <div>
            <Paragraph>1. 解压下载的 zip 文件</Paragraph>
            <Paragraph>2. 将 Ollama.app 拖拽到 Applications 文件夹</Paragraph>
            <Paragraph>3. 双击启动 Ollama 应用</Paragraph>
          </div>
        ),
      },
      {
        title: '验证安装',
        description: '检查 Ollama 是否正常运行',
        content: (
          <div>
            <Paragraph>1. 打开终端 (Terminal)</Paragraph>
            <Paragraph>
              2. 运行命令: <code>ollama --version</code>
            </Paragraph>
            <Paragraph>3. 如果显示版本号，说明安装成功</Paragraph>
          </div>
        ),
      },
      {
        title: '下载模型',
        description: '下载你需要的AI模型',
        content: (
          <div>
            <Paragraph>运行以下命令下载模型：</Paragraph>
            <Paragraph>
              <code>ollama pull llama2</code> - 下载 Llama 2 模型
            </Paragraph>
            <Paragraph>
              <code>ollama pull mistral</code> - 下载 Mistral 模型
            </Paragraph>
            <Paragraph>
              <code>ollama pull codellama</code> - 下载 Code Llama 模型
            </Paragraph>
          </div>
        ),
      },
    ],
    linux: [
      {
        title: '安装 Ollama',
        description: '使用一键安装脚本',
        content: (
          <div>
            <Paragraph>运行以下命令安装 Ollama：</Paragraph>
            <Paragraph>
              <code>curl -fsSL https://ollama.ai/install.sh | sh</code>
            </Paragraph>
            <Paragraph>或者手动下载并安装：</Paragraph>
            <Paragraph>
              <code>wget https://ollama.ai/download/ollama-linux-amd64</code>
            </Paragraph>
            <Paragraph>
              <code>chmod +x ollama-linux-amd64</code>
            </Paragraph>
            <Paragraph>
              <code>sudo mv ollama-linux-amd64 /usr/local/bin/ollama</code>
            </Paragraph>
          </div>
        ),
      },
      {
        title: '启动服务',
        description: '启动 Ollama 服务',
        content: (
          <div>
            <Paragraph>运行以下命令启动服务：</Paragraph>
            <Paragraph>
              <code>ollama serve</code>
            </Paragraph>
            <Paragraph>或者作为系统服务运行：</Paragraph>
            <Paragraph>
              <code>sudo systemctl enable ollama</code>
            </Paragraph>
            <Paragraph>
              <code>sudo systemctl start ollama</code>
            </Paragraph>
          </div>
        ),
      },
      {
        title: '验证安装',
        description: '检查 Ollama 是否正常运行',
        content: (
          <div>
            <Paragraph>1. 打开新的终端窗口</Paragraph>
            <Paragraph>
              2. 运行命令: <code>ollama --version</code>
            </Paragraph>
            <Paragraph>3. 如果显示版本号，说明安装成功</Paragraph>
          </div>
        ),
      },
      {
        title: '下载模型',
        description: '下载你需要的AI模型',
        content: (
          <div>
            <Paragraph>运行以下命令下载模型：</Paragraph>
            <Paragraph>
              <code>ollama pull llama2</code> - 下载 Llama 2 模型
            </Paragraph>
            <Paragraph>
              <code>ollama pull mistral</code> - 下载 Mistral 模型
            </Paragraph>
            <Paragraph>
              <code>ollama pull codellama</code> - 下载 Code Llama 模型
            </Paragraph>
          </div>
        ),
      },
    ],
  }

  const currentSteps = installSteps[os]

  return (
    <Modal
      title={
        <Space>
          <DownloadOutlined />
          Ollama 安装指南
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={800}
    >
      <div className="space-y-6">
        {/* 系统检测 */}
        <Alert
          message={
            <Space>
              {os === 'windows' && <WindowsOutlined />}
              {os === 'mac' && <AppleOutlined />}
              {os === 'linux' && <CodeOutlined />}
              检测到您的操作系统:{' '}
              {os === 'windows' ? 'Windows' : os === 'mac' ? 'macOS' : 'Linux'}
            </Space>
          }
          type="info"
          showIcon
        />

        {/* 安装步骤 */}
        <Steps
          direction="vertical"
          current={-1}
          items={currentSteps.map((step, index) => ({
            title: step.title,
            description: step.description,
            icon:
              index === currentSteps.length - 1 ? (
                <CheckCircleOutlined />
              ) : undefined,
          }))}
        />

        {/* 详细步骤 */}
        <div className="space-y-4">
          {currentSteps.map((step, index) => (
            <Card
              key={index}
              size="small"
              title={`${index + 1}. ${step.title}`}
            >
              {step.content}
            </Card>
          ))}
        </div>

        {/* 常见问题 */}
        <Card title="常见问题" size="small">
          <div className="space-y-3">
            <div>
              <Text strong>Q: Ollama 服务无法启动怎么办？</Text>
              <br />
              <Text>
                A: 检查端口 11434 是否被占用，或尝试重启 Ollama 服务。
              </Text>
            </div>
            <div>
              <Text strong>Q: 模型下载很慢怎么办？</Text>
              <br />
              <Text>A: 可以尝试使用代理或者选择较小的模型进行测试。</Text>
            </div>
            <div>
              <Text strong>Q: 如何查看已安装的模型？</Text>
              <br />
              <Text>
                A: 运行命令 <code>ollama list</code> 查看所有已安装的模型。
              </Text>
            </div>
          </div>
        </Card>

        {/* 有用链接 */}
        <Card title="有用链接" size="small">
          <Space direction="vertical">
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ollama 官方网站
            </a>
            <a
              href="https://github.com/jmorganca/ollama"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ollama GitHub 仓库
            </a>
            <a
              href="https://ollama.ai/library"
              target="_blank"
              rel="noopener noreferrer"
            >
              模型库
            </a>
          </Space>
        </Card>
      </div>
    </Modal>
  )
}

export default OllamaInstallGuide
