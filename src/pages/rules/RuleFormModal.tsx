import { Rule } from '@/types'
import { Form, Input, Modal, ModalProps, Switch } from 'antd'
import { useEffect } from 'react'

export interface RuleFormModalProps extends Omit<ModalProps, 'onOk'> {
  initValue?: Rule
  onOk?: (rule: Rule) => void
}

const RuleFormModal: React.FC<RuleFormModalProps> = ({
  initValue,
  onOk,
  onCancel,
  ...rest
}: RuleFormModalProps) => {
  const [form] = Form.useForm<Rule>()

  useEffect(() => {
    initValue && form.setFieldsValue(initValue)
  }, [initValue])

  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        const rule = form.getFieldsValue()
        onOk?.(rule)
      })
      .catch(() => {})
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
  }

  return (
    <Modal {...rest} onOk={handleOk} onCancel={handleCancel}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="ruleName"
          label="条码规则名称"
          rules={[{ required: true, message: '请输入条码规则名称' }]}
        >
          <Input placeholder="请输入条码规则名称" />
        </Form.Item>
        <Form.Item
          name="ruleValue"
          label="条码规则"
          rules={[{ required: true, message: '请输入条码规则' }]}
        >
          <Input placeholder="请输入条码规则" />
        </Form.Item>
        <Form.Item name="isDefault" label="默认" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RuleFormModal
