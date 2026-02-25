import { Table, Button, Space, Tag, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const Projects = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 状态映射
  const statusMap = {
    planning: { text: '规划中', color: 'default' },
    inProgress: { text: '进行中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    suspended: { text: '已暂停', color: 'warning' },
    cancelled: { text: '已取消', color: 'error' }
  };

  // 优先级映射
  const priorityMap = {
    high: { text: '高', color: 'red' },
    medium: { text: '中', color: 'orange' },
    low: { text: '低', color: 'blue' }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '项目描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const priorityInfo = priorityMap[priority] || { text: '未知', color: 'default' };
        return <Tag color={priorityInfo.color}>{priorityInfo.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusInfo = statusMap[status] || { text: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  // 初始化数据
  useEffect(() => {
    fetchProjects();
  }, []);

  // 获取项目列表
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // 模拟数据，实际应该从 API 获取
      const mockData = [
        {
          id: 1,
          name: '后台管理系统',
          description: '企业内部后台管理系统开发',
          owner: '张三',
          priority: 'high',
          status: 'inProgress',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
        },
        {
          id: 2,
          name: '移动端APP',
          description: '移动端应用开发项目',
          owner: '李四',
          priority: 'medium',
          status: 'planning',
          startDate: '2024-03-01',
          endDate: '2024-09-30',
        },
        {
          id: 3,
          name: '数据分析平台',
          description: '大数据分析与可视化平台',
          owner: '王五',
          priority: 'high',
          status: 'inProgress',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
        },
      ];

      const formattedData = mockData.map(project => ({ ...project, key: project.id }));
      setData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索功能
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.description.toLowerCase().includes(value.toLowerCase()) ||
      item.owner.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // 打开新建弹窗
  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    form.setFieldsValue({
      priority: 'medium',
      status: 'planning',
    });
    setIsModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record) => {
    setEditingProject(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalOpen(true);
  };

  // 删除项目
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${record.name}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 实际应该调用 API 删除
          setData(prev => prev.filter(item => item.id !== record.id));
          setFilteredData(prev => prev.filter(item => item.id !== record.id));
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const projectData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
      };

      if (editingProject) {
        // 编辑项目
        const updatedProject = { ...editingProject, ...projectData };
        setData(prev => prev.map(item => item.id === editingProject.id ? updatedProject : item));
        setFilteredData(prev => prev.map(item => item.id === editingProject.id ? updatedProject : item));
        message.success('项目更新成功');
      } else {
        // 新建项目
        const newProject = {
          id: Date.now(),
          key: Date.now(),
          ...projectData,
        };
        setData(prev => [...prev, newProject]);
        setFilteredData(prev => [...prev, newProject]);
        message.success('项目创建成功');
      }

      handleCancel();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input.Search
          placeholder="搜索项目名称、描述或负责人"
          allowClear
          style={{ width: 300 }}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建项目
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item
            label="负责人"
            name="owner"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="planning">规划中</Select.Option>
              <Select.Option value="inProgress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="suspended">已暂停</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="开始日期"
            name="startDate"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
          </Form.Item>

          <Form.Item
            label="结束日期"
            name="endDate"
            rules={[{ required: true, message: '请选择结束日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
