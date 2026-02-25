import { Table, Button, Space, Tag, message, Modal, Form, Input, Select, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getUserList, createUser, deleteUser, updateUser } from '../api/user';
import { getDepartmentList } from '../api/department';

const Users = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedParentDept, setSelectedParentDept] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  // 状态映射
  const statusMap = {
    1: { text: '正常', color: 'green' },
    0: { text: '禁用', color: 'default' },
    '-1': { text: '删除', color: 'red' },
    2: { text: '未验证', color: 'orange' }
  };

  // 获取部门显示名称
  const getDepartmentName = (departmentId, parentDepartmentId) => {
    if (!departmentId) return '-';

    const dept = departments.find(d => d.id === departmentId);
    if (!dept) return '-';

    // 如果 parent_id 是 null，说明是一级部门
    if (parentDepartmentId === null || parentDepartmentId === undefined) {
      return dept.name;
    }

    // 否则显示：子部门 - 父部门
    const parentDept = departments.find(d => d.id === parentDepartmentId);
    if (parentDept) {
      return `${dept.name} - ${parentDept.name}`;
    }

    return dept.name;
  };

  // 获取一级部门列表
  const getParentDepartments = () => {
    return departments.filter(d => d.parent_id === null);
  };

  // 获取指定父部门的子部门列表
  const getSubDepartments = (parentId) => {
    return departments.filter(d => d.parent_id === parentId);
  };
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '部门',
      dataIndex: 'department_id',
      key: 'department_id',
      render: (departmentId, record) => getDepartmentName(departmentId, record.parent_department_id),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 0 ? 'red' : 'blue'}>
          {role === 0 ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = statusMap[status] || { text: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUserList();
      // 假设 API 返回的数据格式为 { data: [...] } 或直接是数组
      const users = Array.isArray(response) ? response : (response?.data || []);
      const formattedUsers = Array.isArray(users) ? users.map(user => ({ ...user, key: user.id })) : [];
      setData(formattedUsers);
      setFilteredData(formattedUsers);
    } catch (error) {
      message.error('获取用户列表失败，请检查后端服务是否启动');
      console.error('获取用户列表失败:', error);
      // 即使失败也设置空数组，避免页面崩溃
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取部门列表
  const fetchDepartments = async () => {
    try {
      const response = await getDepartmentList();
      const depts = Array.isArray(response) ? response : (response?.data || []);
      setDepartments(depts);
    } catch (error) {
      message.error('获取部门列表失败');
      console.error('获取部门列表失败:', error);
      setDepartments([]);
    }
  };

  // 搜索功能
  const handleSearch = (value) => {
    setSearchText(value);
    filterUsers(value, activeTab);
  };

  // 根据搜索文本和选中的 tab 过滤用户
  const filterUsers = (search, tab) => {
    let filtered = data;

    // 按部门过滤
    if (tab !== 'all') {
      const deptId = parseInt(tab);
      filtered = filtered.filter(user => {
        // 显示该部门及其子部门的用户
        if (user.department_id === deptId) return true;
        if (user.parent_department_id === deptId) return true;
        return false;
      });
    }

    // 按搜索文本过滤
    if (search) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  // 切换 tab
  const handleTabChange = (key) => {
    setActiveTab(key);
    filterUsers(searchText, key);
  };

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  // 当数据或 tab 变化时，重新过滤
  useEffect(() => {
    filterUsers(searchText, activeTab);
  }, [data]);

  // 打开添加用户弹窗
  const handleAdd = () => {
    setEditingUser(null);
    setSelectedParentDept(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 打开编辑用户弹窗
  const handleEdit = (record) => {
    setEditingUser(record);
    setSelectedParentDept(record.parent_department_id);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      parent_department_id: record.parent_department_id,
      department_id: record.department_id,
      role: record.role,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setSelectedParentDept(null);
    form.resetFields();
  };

  // 处理上级部门变化
  const handleParentDeptChange = (value) => {
    setSelectedParentDept(value);
    // 清空子部门选择
    form.setFieldsValue({ department_id: undefined });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 如果没有选择子部门，parent_department_id 设置为 null
      const submitData = {
        ...values,
        department_id: values.department_id || values.parent_department_id,
        parent_department_id: values.department_id ? values.parent_department_id : null
      };

      // 如果是编辑模式且没有修改密码，删除 password 字段
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      if (editingUser) {
        // 编辑模式
        await updateUser(editingUser.id, submitData);
        message.success('更新用户成功');
      } else {
        // 添加模式
        await createUser(submitData);
        message.success('添加用户成功');
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setSelectedParentDept(null);
      form.resetFields();
      fetchUsers(); // 刷新列表
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || (editingUser ? '更新用户失败' : '添加用户失败');
        message.error(errorMsg);
        console.error('操作失败:', error);
      }
    }
  };

  // 删除用户
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.username}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success('删除用户成功');
          fetchUsers(); // 刷新列表
        } catch (error) {
          message.error('删除用户失败');
          console.error('删除用户失败:', error);
        }
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>用户管理</h1>
        <Space>
          <Input.Search
            placeholder="搜索用户名或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button type="primary" onClick={handleAdd}>添加用户</Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'all',
            label: `全部用户 (${activeTab === 'all' ? filteredData.length : data.length})`,
            children: <Table columns={columns} dataSource={filteredData} loading={loading} />
          },
          ...getParentDepartments().map(dept => ({
            key: dept.id.toString(),
            label: `${dept.name} (${data.filter(u => u.department_id === dept.id || u.parent_department_id === dept.id).length})`,
            children: <Table columns={columns} dataSource={filteredData} loading={loading} />
          }))
        ]}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="部门"
            name="parent_department_id"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select
              placeholder="请选择部门"
              onChange={handleParentDeptChange}
            >
              {getParentDepartments().map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedParentDept && getSubDepartments(selectedParentDept).length > 0 && (
            <Form.Item
              label="子部门"
              name="department_id"
              rules={[{ required: true, message: '请选择子部门' }]}
            >
              <Select placeholder="请选择子部门">
                {getSubDepartments(selectedParentDept).map(dept => (
                  <Select.Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: !editingUser, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? '不修改请留空' : '请输入密码'} />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value={0}>管理员</Select.Option>
              <Select.Option value={1}>普通用户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
              <Select.Option value={2}>未验证</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;

