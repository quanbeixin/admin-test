import { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, Select, message } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getTaskList } from '../api/testCase';

const { Option } = Select;

const TestTaskList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('');

  // 加载任务列表
  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (statusFilter) params.status = statusFilter;
      if (environmentFilter) params.environment = environmentFilter;

      const response = await getTaskList(params);
      setTasks(response.data.list || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      message.error('加载任务列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentPage, pageSize, statusFilter, environmentFilter]);

  // 查看详情
  const handleViewDetail = (taskId) => {
    navigate(`/test-task/${taskId}`);
  };

  // 表格列定义
  const columns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '测试用例',
      dataIndex: 'case_name',
      key: 'case_name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          running: { color: 'processing', text: '执行中' },
          success: { color: 'success', text: '成功' },
          failed: { color: 'error', text: '失败' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '环境',
      dataIndex: 'environment',
      key: 'environment',
      width: 100,
      render: (env) => {
        const envMap = {
          dev: { color: 'cyan', text: '开发' },
          test: { color: 'blue', text: '测试' },
          staging: { color: 'orange', text: '预发' },
          prod: { color: 'red', text: '生产' },
        };
        const config = envMap[env] || { color: 'default', text: env };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '步骤统计',
      key: 'steps',
      width: 150,
      render: (_, record) => (
        <span>
          总计: {record.total_steps} |
          <span style={{ color: '#52c41a', marginLeft: 4 }}>成功: {record.success_steps}</span> |
          <span style={{ color: '#ff4d4f', marginLeft: 4 }}>失败: {record.failed_steps}</span>
        </span>
      ),
    },
    {
      title: '执行时长',
      dataIndex: 'execution_time',
      key: 'execution_time',
      width: 100,
      render: (time) => time ? `${time}秒` : '-',
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 180,
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 180,
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>测试任务列表</h1>

      <Card>
        {/* 筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="状态筛选"
              style={{ width: 150 }}
              allowClear
              value={statusFilter || undefined}
              onChange={(value) => {
                setStatusFilter(value || '');
                setCurrentPage(1);
              }}
            >
              <Option value="running">执行中</Option>
              <Option value="success">成功</Option>
              <Option value="failed">失败</Option>
            </Select>

            <Select
              placeholder="环境筛选"
              style={{ width: 150 }}
              allowClear
              value={environmentFilter || undefined}
              onChange={(value) => {
                setEnvironmentFilter(value || '');
                setCurrentPage(1);
              }}
            >
              <Option value="dev">开发</Option>
              <Option value="test">测试</Option>
              <Option value="staging">预发</Option>
              <Option value="prod">生产</Option>
            </Select>

            <Button icon={<ReloadOutlined />} onClick={loadTasks}>
              刷新
            </Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default TestTaskList;
