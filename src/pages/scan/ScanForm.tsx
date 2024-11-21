import { QuestionCircleOutlined, ScanOutlined } from '@ant-design/icons'
import {
  Col,
  Form,
  Input,
  InputRef,
  notification,
  Row,
  Switch,
  Tooltip,
} from 'antd'
import { useEffect, useRef } from 'react'
import { useScan } from '../../store/product'
import { DataType } from '../../types'
import dayjs from '../../utils/dayjs'

type FormInstance = Pick<DataType, 'qrcode'> & { autoFocus?: boolean }

const ScanForm: React.FC<{
  disabled: boolean
  onSubmit: (data: DataType) => void
}> = ({ disabled, onSubmit }) => {
  const [api, contextHolder] = notification.useNotification()
  const [form] = Form.useForm<FormInstance>()
  const { product } = useScan()
  const inputRef = useRef<InputRef>(null!)

  useEffect(() => {
    if (
      form.getFieldValue('autoFocus') &&
      dayjs().isSame(product.scanDate, 'D')
    ) {
      inputRef.current.focus()
    }
  }, [product.scanDate])

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

  const onBlur = () => {
    if (form.getFieldValue('autoFocus')) {
      inputRef.current.focus()
      api.warning({
        key: 1,
        message: '已自动聚焦,请继续扫码',
        description: (
          <>
            如果需要进行其他操作，请先
            <button className="text-primary" onClick={onCancelAutoFocus}>
              取消自动聚焦
            </button>
            。
          </>
        ),
        placement: 'top',
        showProgress: true,
        pauseOnHover: true,
      })
    }
  }

  const onCancelAutoFocus = () => {
    form.setFieldValue('autoFocus', false)
    api.success({
      key: 1,
      message: '已取消自动聚焦',
      description: (
        <>
          可以进行其他操作，请注意此时扫码不会进行录入，如需录入，请先手动将
          <button
            className="text-primary"
            onClick={() => inputRef.current.focus()}
          >
            文本框聚焦
          </button>
          ！
        </>
      ),
      placement: 'top',
      showProgress: true,
      pauseOnHover: true,
    })
  }

  const onChecked = (checked: boolean) => {
    if (checked) {
      inputRef.current.focus()
    } else {
      api.destroy()
    }
  }

  return (
    <>
      <Form<{
        qrcode: string
      }>
        form={form}
        initialValues={{
          qrcode: '',
          autoFocus: true,
        }}
        disabled={disabled}
        className="[&_.ant-form-item]:!mb-0"
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="扫描二维码" name="qrcode">
              <Input
                ref={inputRef}
                placeholder="请扫描二维码"
                prefix={
                  <ScanOutlined
                    style={{ fontSize: 24, color: 'rgba(0,0,0,.6)' }}
                  />
                }
                size="large"
                autoFocus
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                maxLength={18}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={
                <span>
                  <span className="mr-2 text-sm">自动聚焦</span>
                  <Tooltip
                    placement="topRight"
                    title="当此选项打开后，文本将会自动框聚焦，防止漏扫码，如需其他操作，请先关闭该选项。"
                    arrow
                  >
                    <QuestionCircleOutlined className="cursor-pointer" />
                  </Tooltip>
                </span>
              }
              name="autoFocus"
              valuePropName="checked"
            >
              <Switch defaultChecked onChange={onChecked} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {contextHolder}
    </>
  )
}

export default ScanForm
