import FloatButtons from '@/components/FloatButtons'
import { readProducts, renameFolder, saveProducts } from '@/native'
import { Product } from '@/types'
import { PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Table,
  TableProps,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductFormModal from './ProductFormModal'

const NewModalButton: React.FC<{
  onOk: (product: Product) => void
}> = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = (e: React.MouseEvent) => {
    setIsModalOpen(true)
  }

  const handleOk = (product: Product) => {
    onOk(product)
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
        新增扫码对象
      </Button>
      <ProductFormModal
        title="新增"
        forceRender
        destroyOnClose
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

const EditModalButton: React.FC<{
  initValue: Product
  onOk: (product: Product) => void
}> = ({ initValue, onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = (e: React.MouseEvent) => {
    setIsModalOpen(true)
  }

  const handleOk = (product: Product) => {
    onOk?.(product)
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button type="primary" size="small" onClick={showModal}>
        编辑
      </Button>
      <ProductFormModal
        title="编辑"
        forceRender
        destroyOnClose
        initValue={initValue}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [api, contextHolder] = message.useMessage()

  const isExists = (newProduct: Product, isUpdate?: boolean) => {
    return products
      .filter((p) =>
        isUpdate ? p.productValue !== newProduct.productValue : true,
      )
      .some((p) => p.productValue === newProduct.productValue)
  }

  const onUpdate = (oldProduct: Product, newProduct: Product) => {
    if (isExists(newProduct, true)) {
      api.warning('扫码对象名称重复')
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

  const onSave = (product: Product) => {
    if (isExists(product)) {
      api.warning('扫码对象名称重复')
      return
    }
    const arr = [product, ...products]
    setProducts(arr)
    saveProducts(arr)
    api.success('新增成功')
  }

  const onDelete = (product: Product) => {
    const finalProducts = products.filter(
      (p) => p.productValue !== product.productValue,
    )
    setProducts(finalProducts)
    saveProducts(finalProducts)
  }

  const columns: TableProps<Product>['columns'] = [
    {
      title: '序号',
      key: 'productValue',
      dataIndex: 'productValue',
      render: (text, product, index) => index + 1,
    },
    {
      title: '扫码对象名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, product) => (
        <Space>
          <EditModalButton
            initValue={product}
            onOk={(newProduct) => onUpdate(product, newProduct)}
          />
          <Popconfirm
            title="确定要删除吗？"
            description="删除后数据会保留，但不会再显示在列表中"
            onConfirm={() => onDelete(product)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    readProducts().then((data) => {
      setProducts(data)
    })
  }, [])
  return (
    <section className="flex h-screen flex-col items-center justify-center gap-y-4 overflow-x-hidden">
      <Card className="w-[50vw]">
        <div className="mb-4">
          <NewModalButton onOk={onSave} />
        </div>
        <Table columns={columns} dataSource={products} rowKey="productValue" />
      </Card>
      <Link to="/">
        <Button type="primary">返回主页</Button>
      </Link>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default Products
