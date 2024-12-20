import { Product } from '@/types'
import { Form, Input, Modal, ModalProps } from 'antd'
import pinyin from 'pinyin'
import { useEffect } from 'react'

export interface ProductFormModalProps extends Omit<ModalProps, 'onOk'> {
  initValue?: Product
  onOk?: (product: Product) => void
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initValue,
  onOk,
  onCancel,
  ...rest
}: ProductFormModalProps) => {
  const [form] = Form.useForm<Product>()

  useEffect(() => {
    initValue && form.setFieldsValue(initValue)
  }, [initValue])

  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        const { productName } = form.getFieldsValue()
        const product: Product = {
          productName,
          productValue: pinyin(productName)
            .reduce((s1, s2) => [...s1, ...s2])
            .join('_'),
        }
        onOk?.(product)
        form.resetFields()
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
          name="productName"
          label="扫码对象名称"
          rules={[{ required: true, message: '请输入扫码对象名称' }]}
        >
          <Input placeholder="请输入扫码对象名称" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProductFormModal
