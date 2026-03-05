import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, Select, Switch, message, Popconfirm, Tag, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getFieldGroups, createFieldGroup, updateFieldGroup, deleteFieldGroup,
  getFieldDefinitions, createFieldDefinition, updateFieldDefinition, deleteFieldDefinition,
  getFieldOptions, createFieldOption, updateFieldOption, deleteFieldOption, batchDeleteFieldOptions
} from '../api/fieldConfig';

const { TextArea } = Input;

const PlatformFieldConfig = () => {
  const [activeTab, setActiveTab] = useState('groups');
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedOptionKeys, setSelectedOptionKeys] = useState([]);
  const [form] = Form.useForm();

  const fieldTypes = [
    { value: 'text', label: '单行文本' }, { value: 'textarea', label: '多行文本' },
    { value: 'number', label: '数字' }, { value: 'select', label: '下拉选择' },
    { value: 'radio', label: '单选按钮' }, { value: 'checkbox', label: '多选框' },
    { value: 'date', label: '日期' }, { value: 'datetime', label: '日期时间' },
    { value: 'switch', label: '开关' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'groups') {
        const res = await getFieldGroups();
        setGroups(res.data || []);
      } else if (activeTab === 'fields') {
        const res = await getFieldDefinitions();
        setFields(res.data || []);
      } else {
        // 先加载字段定义，再加载选项
        let fieldsData = fields;
        if (fields.length === 0) {
          const fieldsRes = await getFieldDefinitions();
          fieldsData = fieldsRes.data || [];
          setFields(fieldsData);
        }
        const res = await getFieldOptions();
        // 转换为树形结构，传入字段数据
        const treeData = convertToTreeData(res.data || [], fieldsData);
        setOptions(treeData);
      }
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 将选项数据转换为树形结构
  const convertToTreeData = (optionsData, fieldsData) => {
    const fieldMap = {};

    // 按字段分组
    optionsData.forEach(option => {
      if (!fieldMap[option.field_name]) {
        // 从传入的字段数据中查找对应的字段信息
        const fieldInfo = fieldsData.find(f => f.field_code === option.field_name);
        const displayName = fieldInfo ? fieldInfo.field_name : option.field_name;

        fieldMap[option.field_name] = {
          key: `field_${option.field_name}`,
          id: `field_${option.field_name}`,
          field_name: displayName, // 显示字段的实际名称
          field_code: option.field_name, // 保留字段代码用于识别
          isParent: true,
          children: []
        };
      }
      fieldMap[option.field_name].children.push({
        ...option,
        key: option.id,
        isParent: false
      });
    });

    return Object.values(fieldMap);
  };

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleCreateOptionForField = (fieldCode) => {
    setEditingRecord(null);
    form.resetFields();
    // 预填充字段名
    form.setFieldsValue({ field_name: fieldCode });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === 'groups') await deleteFieldGroup(id);
      else if (activeTab === 'fields') await deleteFieldDefinition(id);
      else await deleteFieldOption(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedOptionKeys.length === 0) {
      message.warning('请选择要删除的选项');
      return;
    }
    try {
      await batchDeleteFieldOptions(selectedOptionKeys);
      message.success(`成功删除 ${selectedOptionKeys.length} 条记录`);
      setSelectedOptionKeys([]);
      loadData();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (activeTab === 'groups') {
        if (editingRecord) await updateFieldGroup(editingRecord.id, values);
        else await createFieldGroup(values);
      } else if (activeTab === 'fields') {
        if (editingRecord) await updateFieldDefinition(editingRecord.id, values);
        else await createFieldDefinition(values);
      } else {
        if (editingRecord) await updateFieldOption(editingRecord.id, values);
        else await createFieldOption(values);
      }
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  // 分组列表列
  const groupColumns = [
    { title: '分组名称', dataIndex: 'group_name', key: 'group_name' },
    { title: '分组代码', dataIndex: 'group_code', key: 'group_code' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: '状态', dataIndex: 'is_active', key: 'is_active', width: 100,
      render: (active) => <Tag color={active ? 'success' : 'default'}>{active ? '启用' : '禁用'}</Tag>
    },
    {
      title: '操作', key: 'action', width: 150, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 字段定义列
  const fieldColumns = [
    { title: '字段名称', dataIndex: 'field_name', key: 'field_name' },
    { title: '字段代码', dataIndex: 'field_code', key: 'field_code' },
    {
      title: '字段��型', dataIndex: 'field_type', key: 'field_type',
      render: (type) => fieldTypes.find(t => t.value === type)?.label || type
    },
    { title: '所属分组', dataIndex: ['group', 'group_name'], key: 'group_name' },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: '必填', dataIndex: 'is_required', key: 'is_required', width: 80,
      render: (required) => <Tag color={required ? 'orange' : 'default'}>{required ? '是' : '否'}</Tag>
    },
    {
      title: '状态', dataIndex: 'is_active', key: 'is_active', width: 100,
      render: (active) => <Tag color={active ? 'success' : 'default'}>{active ? '启用' : '禁用'}</Tag>
    },
    {
      title: '操作', key: 'action', width: 150, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 字段选项列
  const optionColumns = [
    {
      title: '字段名/选项值',
      dataIndex: 'field_name',
      key: 'field_name',
      width: 200,
      render: (text, record) => {
        if (record.isParent) {
          return <Tag color="blue" style={{ fontSize: 14 }}>{text}</Tag>;
        }
        return record.option_value;
      }
    },
    {
      title: '选项标签',
      dataIndex: 'option_label',
      key: 'option_label',
      render: (text, record) => record.isParent ? '-' : (text || '-')
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      render: (color, record) => {
        if (record.isParent) return '-';
        if (!color) return '-';
        return (
          <Space>
            <div style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              border: '1px solid #d9d9d9',
              borderRadius: 4
            }} />
            <span style={{ fontSize: 12, color: '#666' }}>{color}</span>
          </Space>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
        return <Tag color={active ? 'success' : 'default'}>{active ? '启用' : '禁用'}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        if (record.isParent) {
          return (
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleCreateOptionForField(record.field_code)}
            >
              添加选项
            </Button>
          );
        }
        return (
          <Space size="small">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
            <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  const renderForm = () => {
    if (activeTab === 'groups') {
      return (
        <>
          <Form.Item name="group_name" label="分组名称" rules={[{ required: true, message: '请输入分组名称' }]}>
            <Input placeholder="请输入分组名称" />
          </Form.Item>
          <Form.Item name="group_code" label="分组代码" rules={[{ required: true, message: '请输入分组代码' }]}>
            <Input placeholder="请输入分组代码（唯一标识）" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="是否启用" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </>
      );
    } else if (activeTab === 'fields') {
      return (
        <>
          <Form.Item name="group_id" label="所属分组" rules={[{ required: true, message: '请选择所属分组' }]}>
            <Select placeholder="请选择所属分组">
              {groups.map(g => <Select.Option key={g.id} value={g.id}>{g.group_name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="field_name" label="字段名称" rules={[{ required: true, message: '请输入字段名称' }]}>
            <Input placeholder="请输入字段名称" />
          </Form.Item>
          <Form.Item name="field_code" label="字段代码" rules={[{ required: true, message: '请输入字段代码' }]}>
            <Input placeholder="请输入字段代码（唯一标识）" />
          </Form.Item>
          <Form.Item name="field_type" label="字段类型" rules={[{ required: true, message: '请选择字段类型' }]}>
            <Select placeholder="请选择字段类型">
              {fieldTypes.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="placeholder" label="占位符">
            <Input placeholder="请输入占位符" />
          </Form.Item>
          <Form.Item name="default_value" label="默认值">
            <Input placeholder="请输入默认值" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_required" label="是否必填" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item name="is_active" label="是否启用" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </>
      );
    } else {
      return (
        <>
          <Form.Item name="field_name" label="所属字段" rules={[{ required: true, message: '请选择所属字段' }]}>
            <Select placeholder="请选择所属字段">
              {fields.map(f => <Select.Option key={f.id} value={f.field_code}>{f.field_name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="option_value" label="选项值" rules={[{ required: true, message: '请输入选项值' }]}>
            <Input placeholder="请输入选项值" />
          </Form.Item>
          <Form.Item name="option_label" label="选项标签" rules={[{ required: true, message: '请输入选项标签' }]}>
            <Input placeholder="请输入选项标签" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input placeholder="请输入颜色（如：#FF0000）" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="是否启用" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </>
      );
    }
  };

  const tabItems = [
    {
      key: 'groups',
      label: '字段分组',
      children: (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>创建分组</Button>
          </Space>
          <Table
            columns={groupColumns}
            dataSource={groups}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20 }}
            scroll={{ x: 1000 }}
          />
        </>
      )
    },
    {
      key: 'fields',
      label: '字段定义',
      children: (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>创建字段</Button>
          </Space>
          <Table
            columns={fieldColumns}
            dataSource={fields}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20 }}
            scroll={{ x: 1200 }}
          />
        </>
      )
    },
    {
      key: 'options',
      label: '字段选项',
      children: (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>创建选项</Button>
            {selectedOptionKeys.length > 0 && (
              <Popconfirm
                title={`确定要删除选中的 ${selectedOptionKeys.length} 条记录吗？`}
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>批量删除</Button>
              </Popconfirm>
            )}
          </Space>
          <Table
            rowSelection={{
              selectedRowKeys: selectedOptionKeys,
              onChange: setSelectedOptionKeys,
              checkStrictly: false,
              getCheckboxProps: (record) => ({
                disabled: record.isParent, // 父节点不可选
              }),
            }}
            columns={optionColumns}
            dataSource={options}
            rowKey="key"
            loading={loading}
            pagination={false}
            defaultExpandAllRows
            scroll={{ x: 1200 }}
          />
        </>
      )
    }
  ];

  return (
    <Card title="平台字段配置">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <Modal
        title={editingRecord ? `编辑${activeTab === 'groups' ? '分组' : activeTab === 'fields' ? '字段' : '选项'}` : `创建${activeTab === 'groups' ? '分组' : activeTab === 'fields' ? '字段' : '选项'}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
          {renderForm()}
        </Form>
      </Modal>
    </Card>
  );
};

export default PlatformFieldConfig;
