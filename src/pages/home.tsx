import dayjs from '@/utils/dayjs'
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, message, Select, Space } from 'antd'
import pinyin from 'pinyin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { readProducts, saveProducts, saveScanData } from '../native'
import { useScan } from '../store/product'
import { Product } from '../types'

const Page: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [newProductName, setNewProductName] = useState<string>('')
  const [api, contextHolder] = message.useMessage()
  const { setProduct } = useScan()
  const navigate = useNavigate()

  useEffect(() => {
    readProducts().then((data) => {
      setProducts(data)
    })
  }, [])

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault()
    if (!newProductName) {
      api.warning('产品名称不能为空')
      return
    }
    const isExists = products.some(
      (item) => item.productName === newProductName,
    )
    if (isExists) {
      api.warning('产品已存在')
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
  const onFinish = ({ productValue }: { productValue: string }) => {
    const productName = products.find(
      (item) => item.productValue === productValue,
    ).productName
    setProduct({
      productName,
      productValue,
      scanDate: dayjs().toDate().getTime(),
    })
    navigate('/scan')
  }

  return (
    <section className="flex h-screen items-center justify-center">
      <Form<{
        productValue: string
      }>
        layout="vertical"
        className="w-[420px]"
        onFinish={onFinish}
      >
        <Form.Item
          label="产品"
          name="productValue"
          rules={[{ required: true, message: '请选择产品' }]}
        >
          <Select
            defaultOpen
            allowClear
            showSearch
            placeholder="请选择产品"
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
                    placeholder="请输入产品名称"
                    onKeyDown={(e) => e.stopPropagation()}
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addItem}
                  >
                    新增产品
                  </Button>
                  <Link to="/products">
                    <Button icon={<AppstoreOutlined />}>管理产品</Button>
                  </Link>
                </Space>
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
    </section>
  )
}

export default Page
