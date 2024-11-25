import { readProducts, renameFolder, saveProducts } from '@/native'
import { Product } from '@/types'
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Table,
  TableProps,
} from 'antd'
import pinyin from 'pinyin'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const EditModalButton: React.FC<{
  initValue: Product
  onOk: (product: Product) => void
}> = ({ initValue, onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm<Product>()

  useEffect(() => {
    form.setFieldsValue(initValue)
  }, [])

  const showModal = (e: React.MouseEvent) => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form
      .validateFields()
      .then(() => {
        const { productName } = form.getFieldsValue()
        const productValue = pinyin(productName)
          .reduce((s1, s2) => [...s1, ...s2])
          .join('_')
        onOk?.({
          productName,
          productValue,
        })
        setIsModalOpen(false)
      })
      .catch(() => {})
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button type="primary" size="small" onClick={showModal}>
        编辑
      </Button>
      <Modal
        title="编辑"
        forceRender
        destroyOnClose
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form}>
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[
              { required: true, message: '请输入产品名称' },
              {
                required: true,
                validator: (_, value) => {
                  if (value !== initValue.productName) {
                    return Promise.resolve()
                  } else {
                    return Promise.reject('产品名称不能和原本的名称一致')
                  }
                },
              },
            ]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [api, contextHolder] = message.useMessage()
  const onOk = (oldProduct: Product, newProduct: Product) => {
    const isExists = products.some(
      (p) => p.productName === newProduct.productName,
    )
    if (isExists) {
      api.warning('产品名称重复')
      return
    }
    const arr = products.map((p) =>
      p.productValue === oldProduct.productValue ? newProduct : p,
    )
    setProducts(arr)
    saveProducts(arr)
    renameFolder(oldProduct.productValue, newProduct.productValue)
    api.success('修改成功')
  }

  const columns: TableProps<Product>['columns'] = [
    {
      title: '序号',
      key: 'productValue',
      dataIndex: 'productValue',
      render: (text, product, index) => index + 1,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, product) => (
        <EditModalButton
          initValue={product}
          onOk={(newProduct) => onOk(product, newProduct)}
        />
      ),
    },
  ]

  useEffect(() => {
    readProducts().then((data) => {
      setProducts(data)
    })
  }, [])
  return (
    <section className="flex h-screen flex-col items-center justify-center gap-y-4 bg-[#f5f5f5]">
      <Card className="w-[50vw]">
        <Table columns={columns} dataSource={products} rowKey="productValue" />
      </Card>
      <Link to="/">
        <Button type="primary">返回主页</Button>
      </Link>
      {contextHolder}
    </section>
  )
}

export default Products
