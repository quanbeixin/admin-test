import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Switch,
  Flex
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  getOptionFieldsTree,
  createOptionField,
  updateOptionField,
  deleteOptionField,
  batchDeleteOptionFields,
  getFieldNames
} from '../api/optionField';

const { Search } = Input;
const { TextArea } = Input;

const OptionFieldList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
  const [filters, setFilters] = useState({
    is_active: ''
  });
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadFieldNames();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters
      };

      const response = await getOptionFieldsTree(params);
      setData(response.data || []);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFieldNames = async () => {
    try {
      const response = await getFieldNames();
      setFieldNames(response.data || []);
    } catch (error) {
      console.error('加载字段名失败:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteOptionField(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的项');
      return;
    }

    try {
      await batchDeleteOptionFields(selectedRowKeys);
      message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
      setSelectedRowKeys([]);
      loadData();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateOptionField(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createOptionField(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
      loadFieldNames(); // 重新加载字段名列表
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || '操作失败';
      message.error(`${editingRecord ? '更新' : '创建'}失败: ${errorMsg}`);
      console.error('提交错误:', error.response?.data || error);
    }
  };

  const columns = [
    {
      title: '字段名/选项',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text, record) => {
        if (record.isParent) {
          return <Tag color="blue" style={{ fontSize: 14 }}>{text}</Tag>;
        }
        return text;
      }
    },
    {
      title: '选项值',
      dataIndex: 'option_value',
      key: 'option_value',
      width: 150,
      render: (text, record) => record.isParent ? '-' : (text || '-')
    },
    {
      title: '显示标签',
      dataIndex: 'option_label',
      key: 'option_label',
      width: 150,
      render: (text, record) => record.isParent ? '-' : (text || '-')
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text, record) => record.isParent ? '-' : (text || '-')
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      render: (text, record) => record.isParent ? '-' : (text ?? '-')
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active, record) => {
        if (record.isParent) return '-';
        return (
          <Tag color={active ? 'success' : 'default'}>
            {active ? '启用' : '禁用'}
          </Tag>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text, record) => {
        if (record.isParent) return '-';
        return text ? new Date(text).toLocaleString('zh-CN') : '-';
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        if (record.isParent) return null;
        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    checkStrictly: false,
    getCheckboxProps: (record) => ({
      disabled: record.isParent, // 父节点不可选
    }),
  };

  return (
    <div>
      <Card>
        <Flex vertical gap="middle" style={{ width: '100%' }}>
          {/* 搜索和筛选 */}
          <Space wrap>
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('is_active', value)}
            >
              <Select.Option value="true">启用</Select.Option>
              <Select.Option value="false">禁用</Select.Option>
            </Select>
          </Space>

          {/* 操作按钮 */}
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建选项
            </Button>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`}
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除
                </Button>
              </Popconfirm>
            )}
          </Space>

          {/* 表格 */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            rowKey="key"
            loading={loading}
            pagination={false}
            defaultExpandAllRows
            scroll={{ x: 1200 }}
          />
        </Flex>
      </Card>

      {/* 创建/编辑 Modal */}
      <Modal
        title={editingRecord ? '编辑选项' : '创建选项'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="field_name"
            label="字段名"
            rules={[
              { required: true, message: '请输入字段名' },
              { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线' }
            ]}
            tooltip="例如: status, stage, creative_type"
          >
            <Input placeholder="请输入字段名（如: status）" />
          </Form.Item>

          <Form.Item
            name="option_value"
            label="选项值"
            rules={[
              { required: true, message: '请输入选项值' },
              { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线' }
            ]}
            tooltip="例如: draft, active, image"
          >
            <Input placeholder="请输入选项值（如: draft）" />
          </Form.Item>

          <Form.Item
            name="option_label"
            label="显示标签"
            rules={[{ required: true, message: '请输入显示标签' }]}
            tooltip="用户看到的中文名称"
          >
            <Input placeholder="请输入显示标签（如: 草稿）" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            tooltip="选项的详细说明（可选）"
          >
            <TextArea
              rows={3}
              placeholder="请输入描述信息（可选）"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="sort_order"
              label="排序"
              initialValue={0}
              tooltip="数值越小越靠前"
              style={{ width: 200 }}
            >
              <Input type="number" placeholder="0" min={0} />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="是否启用"
              valuePropName="checked"
              initialValue={true}
              style={{ width: 200 }}
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default OptionFieldList;
