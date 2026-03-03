import { Card, Table, Button, Space, Tag, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const AutomatedTest = () => {
  const [loading, setLoading] = useState(false);

  // 模拟测试数据
  const [testData] = useState([
    {
      key: '1',
      testName: '登录功能测试',
      status: 'success',
      lastRun: '2026-03-02 10:30:00',
      duration: '2.5s',
      passRate: '100%',
    },
    {
      key: '2',
      testName: '用户管理测试',
      status: 'running',
      lastRun: '2026-03-02 11:00:00',
      duration: '5.2s',
      passRate: '95%',
    },
    {
      key: '3',
      testName: '数据仪表盘测试',
      status: 'failed',
      lastRun: '2026-03-02 09:15:00',
      duration: '3.8s',
      passRate: '80%',
    },
    {
      key: '4',
      testName: '广告创意测试',
      status: 'pending',
      lastRun: '-',
      duration: '-',
      passRate: '-',
    },
  ]);

  const columns = [
    {
      title: '测试名称',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          success: { color: 'success', text: '通过' },
          failed: { color: 'error', text: '失败' },
          running: { color: 'processing', text: '运行中' },
          pending: { color: 'default', text: '待运行' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '最后运行时间',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: '运行时长',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '通过率',
      dataIndex: 'passRate',
      key: 'passRate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunTest(record)}
            disabled={record.status === 'running'}
          >
            运行
          </Button>
          <Button
            type="link"
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  const handleRunTest = (record) => {
    message.info(`开始运行测试: ${record.testName}`);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(`测试 ${record.testName} 运行完成`);
    }, 2000);
  };

  const handleViewDetail = (record) => {
    message.info(`查看测试详情: ${record.testName}`);
  };

  const handleRunAll = () => {
    message.info('开始运行所有测试');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('所有测试运行完成');
    }, 3000);
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>自动化测试</h1>

      <Card
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRunAll}
              loading={loading}
            >
              运行所有测试
            </Button>
            <Button icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={testData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default AutomatedTest;
