import { Button, Input, Space } from 'antd'
import { useEffect, useState } from 'react'

const QuickAction: React.FC<{
  value: string
  onSubmit: (value: string) => void
  onReset: () => void
}> = ({ value, onSubmit, onReset }) => {
  const [innerValue, setInnerValue] = useState(value ?? '')

  useEffect(() => {
    setInnerValue(value)
  }, [value])

  // 按回车提交
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit(innerValue)
    }
  }

  return (
    <Space>
      <Input
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
        placeholder="请输入条码"
        className="w-72"
        onKeyDown={handleKeyDown}
      />
      <Button type="primary" onClick={() => onSubmit(innerValue)}>
        快速搜索
      </Button>
      <Button onClick={onReset}>重置</Button>
    </Space>
  )
}

export default QuickAction
