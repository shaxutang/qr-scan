import FloatButtons from '@/components/FloatButtons'
import dayjs from '@/utils/dayjs'
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, message, Select, Space } from 'antd'
import pinyin from 'pinyin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { readProducts, readRules, saveProducts, saveScanData } from '../native'
import { useScan } from '../store/product'
import { Product, Rule } from '../types'

const Page: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [newProductName, setNewProductName] = useState<string>('')
  const [api, contextHolder] = message.useMessage()
  const { setProduct } = useScan()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  useEffect(() => {
    readProducts().then((data) => {
      setProducts(data)
    })
    readRules().then((data) => {
      setRules(data)
      if (data.length) {
        form.setFieldValue('ruleValue', data[0].ruleValue)
      }
    })
  }, [])

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault()
    if (!newProductName) {
      api.warning('扫码对象名称不能为空')
      return
    }
    const isExists = products.some(
      (item) => item.productName === newProductName,
    )
    if (isExists) {
      api.warning('扫码对象已存在')
      return
    }
    const product: Product = {
      productName: newProductName,
      productValue: pinyin(newProductName)
        .reduce((s1, s2) => [...s1, ...s2])
        .join('_'),
    }
    setProducts([...products, product])
    setNewProductName('')
    saveProducts([...products, product])
    saveScanData(product.productValue, [])
  }
  const onFinish = ({
    productValue,
    ruleValue,
  }: {
    productValue: string
    ruleValue: string
  }) => {
    const productName = products.find(
      (item) => item.productValue === productValue,
    ).productName
    setProduct({
      productName,
      productValue,
      scanRule: ruleValue,
      scanDate: dayjs().toDate().getTime(),
    })
    navigate('/scan')
  }

  return (
    <section className="flex h-screen items-center justify-center">
      <Form<{
        productValue: string
      }>
        form={form}
        layout="vertical"
        className="w-[420px]"
        onFinish={onFinish}
      >
        <Form.Item
          label="扫码对象"
          name="productValue"
          rules={[{ required: true, message: '请选择扫码对象' }]}
        >
          <Select
            defaultOpen
            allowClear
            showSearch
            placeholder="请选择扫码对象"
            options={products.map(({ productName, productValue }) => ({
              label: productName,
              value: productValue,
            }))}
            size="large"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <Input
                    placeholder="请输入扫码对象名称"
                    onKeyDown={(e) => e.stopPropagation()}
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addItem}
                  >
                    新增
                  </Button>
                  <Link to="/products">
                    <Button icon={<AppstoreOutlined />}>管理扫码对象</Button>
                  </Link>
                </Space>
              </>
            )}
          />
        </Form.Item>
        <Form.Item
          label="扫码规则"
          name="ruleValue"
          rules={[{ required: true, message: '请选择扫码规则' }]}
        >
          <Select
            allowClear
            placeholder="请选择扫码规则"
            options={rules.map(({ ruleName, ruleValue }) => ({
              label: ruleName,
              value: ruleValue,
            }))}
            size="large"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Link to="/rules">
                  <Button block icon={<AppstoreOutlined />}>
                    管理扫码规则
                  </Button>
                </Link>
              </>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            下一步
          </Button>
        </Form.Item>
      </Form>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default Page
