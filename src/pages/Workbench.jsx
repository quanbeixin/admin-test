import { Card, List, Button, Space, Tag, message, Modal, Form, Input, DatePicker, Select, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getMyTasks, createTask, updateTask, deleteTask } from '../api/task';

const Workbench = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  // 优先级映射
  const priorityMap = {
    0: { text: 'P0', color: 'red' },
    1: { text: 'P1', color: 'orange' },
    2: { text: 'P2', color: 'blue' },
    3: { text: 'P3', color: 'default' }
  };

  // 状态映射
  const statusMap = {
    pending: { text: '待处理', color: 'default' },
    in_progress: { text: '进行中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    cancelled: { text: '已取消', color: 'error' }
  };

  // 初始化数据
  useEffect(() => {
    fetchTasks();
  }, []);

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      const response = await getMyTasks();
      const tasks = Array.isArray(response) ? response : (response?.data || []);
      const formattedTasks = Array.isArray(tasks) ? tasks.map(task => ({ ...task, key: task.id })) : [];

      // 分离今日任务和待办任务
      const today = dayjs().format('YYYY-MM-DD');
      const todayTasksList = formattedTasks.filter(task => task.work_date === today);
      const todoTasksList = formattedTasks.filter(task => task.work_date !== today);

      setTodayTasks(todayTasksList);
      setTodoList(todoTasksList);
    } catch (error) {
      message.error('获取任务列表失败');
      console.error('获取任务列表失败:', error);
      setTodayTasks([]);
      setTodoList([]);
    }
  };

  // 打开新建/编辑弹窗
  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        work_date: task.work_date ? dayjs(task.work_date) : null
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        priority: 1,
        status: 'pending',
        work_date: dayjs()
      });
    }
    setIsModalOpen(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        work_date: values.work_date ? values.work_date.format('YYYY-MM-DD') : null
      };

      if (editingTask) {
        // 编辑任务
        await updateTask(editingTask.id, taskData);
        message.success('任务更新成功');
      } else {
        // 新建任务
        await createTask(taskData);
        message.success('任务创建成功');
      }

      handleCloseModal();
      fetchTasks(); // 刷新列表
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        const errorMsg = error.response?.data?.message || (editingTask ? '更新任务失败' : '创建任务失败');
        message.error(errorMsg);
        console.error('操作失败:', error);
      }
    }
  };

  // 删除任务
  const handleDelete = async (task) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${task.title}"吗？`,
      onOk: async () => {
        try {
          await deleteTask(task.id);
          message.success('任务删除成功');
          fetchTasks(); // 刷新列表
        } catch (error) {
          const errorMsg = error.response?.data?.message || '删除任务失败';
          message.error(errorMsg);
          console.error('删除任务失败:', error);
        }
      }
    });
  };

  // 切换任务状态
  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      // 只发送必要的字段，不包括 key 等前端专用字段
      const updateData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        work_date: task.work_date
      };
      await updateTask(task.id, updateData);
      message.success(newStatus === 'completed' ? '任务已完成' : '任务已重新打开');
      fetchTasks(); // 刷新列表
    } catch (error) {
      const errorMsg = error.response?.data?.message || '更新任务状态失败';
      message.error(errorMsg);
      console.error('更新任务状态失败:', error);
    }
  };

  // 渲染任务列表项
  const renderTaskItem = (item) => (
    <List.Item
      actions={[
        <Button
          type="link"
          icon={<CheckCircleOutlined />}
          onClick={() => handleToggleStatus(item)}
        >
          {item.status === 'completed' ? '重新打开' : '完成'}
        </Button>,
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleOpenModal(item)}
        >
          编辑
        </Button>,
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(item)}
        >
          删除
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Checkbox
            checked={item.status === 'completed'}
            onChange={() => handleToggleStatus(item)}
          />
        }
        title={
          <Space>
            <span style={{ textDecoration: item.status === 'completed' ? 'line-through' : 'none' }}>
              {item.title}
            </span>
            <Tag color={priorityMap[item.priority].color}>
              {priorityMap[item.priority].text}
            </Tag>
            <Tag color={statusMap[item.status].color}>
              {statusMap[item.status].text}
            </Tag>
          </Space>
        }
        description={
          <div>
            <div>{item.description}</div>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              <ClockCircleOutlined /> 截止日期: {item.work_date}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 今日工作事项 */}
        <Card
          title="今日工作事项"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              新建任务
            </Button>
          }
        >
          <List
            dataSource={todayTasks}
            renderItem={renderTaskItem}
            locale={{ emptyText: '暂无今日工作事项' }}
          />
        </Card>

        {/* 待办事项 */}
        <Card title="待办事项">
          <List
            dataSource={todoList}
            renderItem={renderTaskItem}
            locale={{ emptyText: '暂无待办事项' }}
          />
        </Card>
      </Space>

      {/* 新建/编辑任务弹窗 */}
      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="任务标题"
            name="title"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            label="任务描述"
            name="description"
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
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Workbench;
