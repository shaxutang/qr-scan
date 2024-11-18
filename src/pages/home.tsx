import { PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, Select, Space } from 'antd'
import pinyin from 'pinyin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { readProducts, saveProducts } from '../native'
import { useScan } from '../store/product'
import { Product } from '../types'
const Page: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [newProductName, setNewProductName] = useState<string>('')
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
    const product: Product = {
      productName: newProductName,
      productValue: pinyin(newProductName)
        .reduce((s1, s2) => [...s1, ...s2])
        .join('_'),
    }
    saveProducts([...products, product])
    setProducts([...products, product])
    setNewProductName('')
  }
  const onFinish = ({ productValue }: { productValue: string }) => {
    const productName = products.find(
      (item) => item.productValue === productValue,
    ).productName
    setProduct({
      productName,
      productValue,
    })
    navigate('/scan')
  }

  return (
    <section className="flex h-screen items-center justify-center">
      <Form<{
        productValue: string
      }>
        layout="vertical"
        className="w-96"
        onFinish={onFinish}
      >
        <Form.Item
          label="产品"
          name="productValue"
          rules={[{ required: true, message: '请选择产品' }]}
        >
          <Select
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
                  <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                    新增产品
                  </Button>
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
    </section>
  )
}

export default Page
