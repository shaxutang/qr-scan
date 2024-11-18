import { ScanOutlined } from '@ant-design/icons'
import { Form, Input } from 'antd'
import { useScan } from '../../store/product'
import { DataType } from '../../types'
import dayjs from '../../utils/dayjs'

const ScanForm: React.FC<{
  onSubmit: (data: DataType) => void
}> = ({ onSubmit }) => {
  const [form] = Form.useForm<Pick<DataType, 'qrcode'>>()
  const { product } = useScan()

  const onChange = (qrcode: string) => {
    if (qrcode.length === 18) {
      onSubmit({
        date: dayjs().toDate().getTime(),
        qrcode,
        ...product,
      })
      form.setFieldValue('qrcode', '')
    }
  }

  return (
    <Form<{
      qrcode: string
    }>
      form={form}
    >
      <Form.Item label="扫描二维码" name="qrcode">
        <Input
          placeholder="请扫描二维码"
          prefix={
            <ScanOutlined style={{ fontSize: 24, color: 'rgba(0,0,0,.6)' }} />
          }
          size="large"
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          maxLength={18}
        />
      </Form.Item>
    </Form>
  )
}

export default ScanForm
