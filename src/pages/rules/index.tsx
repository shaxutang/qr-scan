import FloatButtons from '@/components/FloatButtons'
import { readRules, saveRules } from '@/native'
import { Rule } from '@/types'
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
import RuleFormModal from './RuleFormModal'

const NewModalButton: React.FC<{
  onOk: (rule: Rule) => void
}> = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = (rule: Rule) => {
    onOk(rule)
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button icon={<PlusOutlined />} type="primary" onClick={showModal}>
        新增扫码规则
      </Button>
      <RuleFormModal
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
  initValue: Rule
  onOk: (rule: Rule) => void
}> = ({ initValue, onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = (e: React.MouseEvent) => {
    setIsModalOpen(true)
  }

  const handleOk = (rule: Rule) => {
    onOk(rule)
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
      <RuleFormModal
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

const Rules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([])
  const [api, contextHolder] = message.useMessage()

  const isExists = (newRule: Rule, isUpdate?: boolean) => {
    return rules
      .filter((r) => (isUpdate ? r.ruleValue !== newRule.ruleValue : true))
      .some((r) => r.ruleValue === newRule.ruleValue)
  }

  const onSave = (rule: Rule) => {
    if (isExists(rule)) {
      api.warning('条码规则重复')
      return
    }
    const savedRules = [rule, ...rules].map((r) => {
      if (rule.isDefault) {
        if (r.ruleValue === rule.ruleValue) {
          return r
        }
        return {
          ...r,
          isDefault: false,
        }
      }
      return r
    })
    setRules(savedRules)
    saveRules(savedRules)
  }

  const onUpdate = (oldRule: Rule, newRule: Rule) => {
    if (isExists(newRule, true)) {
      api.warning('条码规则重复')
      return
    }
    const arr = rules
      .map((r) => (r.ruleValue === oldRule.ruleValue ? newRule : r))
      .map((r) => {
        if (newRule.isDefault) {
          if (r.ruleValue === newRule.ruleValue) {
            return r
          }
          return {
            ...r,
            isDefault: false,
          }
        }
        return r
      })
    setRules([...arr])
    saveRules(arr)
    api.success('修改成功')
  }

  const onDelete = (rule: Rule) => {
    const finalRules = rules.filter((r) => r.ruleValue !== rule.ruleValue)
    setRules(finalRules)
    saveRules(finalRules)
  }

  const columns: TableProps<Rule>['columns'] = [
    {
      title: '序号',
      key: 'ruleValue',
      dataIndex: 'ruleValue',
      render: (text, product, index) => index + 1,
    },
    {
      title: '扫码规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
    },
    {
      title: '扫码规则',
      dataIndex: 'ruleValue',
      key: 'ruleValue',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, rule) => (
        <Space>
          <EditModalButton
            initValue={rule}
            onOk={(newRule) => onUpdate(rule, newRule)}
          />
          <Popconfirm
            title="确定要删除吗？"
            description="删除后数据会保留，但不会再显示在列表中"
            onConfirm={() => onDelete(rule)}
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
    readRules().then((data) => {
      setRules(data)
    })
  }, [])
  return (
    <section className="flex h-screen flex-col items-center justify-center gap-y-4 overflow-x-hidden">
      <Card className="w-[50vw]">
        <div className="mb-4">
          <NewModalButton onOk={onSave} />
        </div>
        <Table columns={columns} dataSource={rules} rowKey="ruleValue" />
      </Card>
      <Link to="/">
        <Button type="primary">返回主页</Button>
      </Link>
      {contextHolder}
      <FloatButtons />
    </section>
  )
}

export default Rules
