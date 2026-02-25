import { Table, Button, Space, Tag, message, Modal, Form, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getTaskList, createTask, deleteTask, updateTask } from '../api/task';

const Tasks = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 状态映射
  const statusMap = {
    pending: { text: '待处理', color: 'default' },
    in_progress: { text: '进行中', color: 'blue' },
    completed: { text: '已完成', color: 'green' },
    cancelled: { text: '已取消', color: 'red' },
  };

  // 优先级映射
  const priorityMap = {
    0: { text: 'P0', color: 'red' },
    1: { text: 'P1', color: 'orange' },
    2: { text: 'P2', color: 'blue' },
    3: { text: 'P3', color: 'default' },
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      width: 100,
      render: (status) => {
        const statusInfo = statusMap[status] || { text: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '截止日期',
      dataIndex: 'work_date',
      key: 'work_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 获取任务列表
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getTaskList();
      const tasks = Array.isArray(response) ? response : (response?.data || []);
      const formattedTasks = Array.isArray(tasks) ? tasks.map(task => ({ ...task, key: task.id })) : [];
      setData(formattedTasks);
      setFilteredData(formattedTasks);
    } catch (error) {
      message.error('获取任务列表失败');
      console.error('获取任务列表失败:', error);
      setData([]);
      setFilteredData([]);
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

    const filtered = data.filter(task =>
      task.title?.toLowerCase().includes(value.toLowerCase()) ||
      task.description?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 打开添加任务弹窗
  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 打开编辑任务弹窗
  const handleEdit = (record) => {
    setEditingTask(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      priority: record.priority,
      status: record.status,
      work_date: record.work_date,
    });
    setIsModalOpen(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log('提交的表单数据:', values);

      if (editingTask) {
        // 编辑模式
        await updateTask(editingTask.id, values);
        message.success('更新任务成功');
      } else {
        // 添加模式
        await createTask(values);
        message.success('添加任务成功');
      }

      setIsModalOpen(false);
      setEditingTask(null);
      form.resetFields();
      fetchTasks(); // 刷新列表
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || (editingTask ? '更新任务失败' : '添加任务失败');
        message.error(errorMsg);
        console.error('操作失败:', error);
        console.error('后端返回的错误:', error.response?.data);
      }
    }
  };

  // 删除任务
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务 "${record.title}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await deleteTask(record.id);
          const successMsg = response?.message || '删除任务成功';
          message.success(successMsg);
          fetchTasks(); // 刷新列表
        } catch (error) {
          const errorMsg = error.response?.data?.message || '删除任务失败';
          message.error(errorMsg);
          console.error('删除任务失败:', error);
        }
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>任务管理</h1>
        <Space>
          <Input.Search
            placeholder="搜索任务名称或描述"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加任务
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filteredData} loading={loading} />

      <Modal
        title={editingTask ? '编辑任务' : '添加任务'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="任务名称"
            name="title"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            label="任务描述"
            name="description"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Select.Option value={0}>P0</Select.Option>
              <Select.Option value={1}>P1</Select.Option>
              <Select.Option value={2}>P2</Select.Option>
              <Select.Option value={3}>P3</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="in_progress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="截止日期"
            name="work_date"
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks;
