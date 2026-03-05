import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllAccounts, createAccount, updateAccount, deleteAccount } from '../api/fbAdAccount';

const AdAccountManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getAllAccounts();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 打开新增/编辑弹窗
  const handleOpenModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        access_token: record.access_token,
        status: record.status,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingRecord) {
        // 更新
        const response = await updateAccount(editingRecord.id, values);
        if (response.success) {
          message.success('更新成功');
          handleCloseModal();
          loadData();
        }
      } else {
        // 创建
        const response = await createAccount(values);
        if (response.success) {
          message.success('创建成功');
          handleCloseModal();
          loadData();
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error(editingRecord ? '更新失败' : '创建失败');
      }
    }
  };

  // 删除账户
  const handleDelete = async (id) => {
    try {
      const response = await deleteAccount(id);
      if (response.success) {
        message.success('删除成功');
        loadData();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
     {
      title: '账户名称',
      dataIndex: 'account_name',
      key: 'account_name',
      width: 150,
    },
    {
      title: 'Access Token',
      dataIndex: 'access_token',
      key: 'access_token',
      ellipsis: true,
      render: (text) => {
        if (!text) return '-';
        const masked = text.substring(0, 20) + '...' + text.substring(text.length - 10);
        return masked;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          active: { text: '启用', color: 'green' },
          disabled: { text: '禁用', color: 'red' },
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <span style={{ color: config.color }}>{config.text}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个账户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="广告账户管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增账户
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingRecord ? '编辑账户' : '新增账户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Access Token"
            name="access_token"
            rules={[{ required: true, message: '请输入 Access Token' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入 Facebook Access Token"
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue="active"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="disabled">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdAccountManagement;
