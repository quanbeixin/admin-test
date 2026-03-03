import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Popconfirm,
  Card,
  Drawer,
  Steps,
  Image,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  runTest,
  getTaskResult,
} from '../api/testCase';

const { TextArea } = Input;
const { Option } = Select;

const TestCaseManagement = () => {
  const [form] = Form.useForm();
  const [executeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [resultDrawerVisible, setResultDrawerVisible] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [executingCase, setExecutingCase] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [pollingTimer, setPollingTimer] = useState(null);

  // 加载测试用例列表
  const loadTestCases = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        ...searchParams,
      };
      const response = await getTestCases(params);
      setTestCases(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      message.error('加载测试用例失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestCases();
  }, [currentPage, pageSize, searchParams]);

  // 搜索处理
  const handleSearch = (values) => {
    setSearchParams(values);
    setCurrentPage(1);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  // 打开新增/编辑弹窗
  const handleOpenModal = (record = null) => {
    setEditingCase(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        steps: JSON.stringify(record.steps, null, 2),
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingCase(null);
    form.resetFields();
  };

  // 保存测试用例
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let steps;
      try {
        steps = JSON.parse(values.steps);
      } catch (e) {
        message.error('步骤 JSON 格式错误');
        return;
      }

      const data = {
        ...values,
        steps,
        tags: values.tags || [],
      };

      if (editingCase) {
        await updateTestCase(editingCase.id, data);
        message.success('更新成功');
      } else {
        await createTestCase(data);
        message.success('创建成功');
      }

      handleCloseModal();
      loadTestCases();
    } catch (error) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      } else {
        message.error('保存失败');
        console.error(error);
      }
    }
  };

  // 删除测试用例
  const handleDelete = async (id) => {
    try {
      await deleteTestCase(id);
      message.success('删除成功');
      loadTestCases();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 打开执行测试弹窗
  const handleOpenExecuteModal = (record) => {
    setExecutingCase(record);
    executeForm.setFieldsValue({
      environment: record.environment || 'test',
    });
    setExecuteModalVisible(true);
  };

  // 关闭执行弹窗
  const handleCloseExecuteModal = () => {
    setExecuteModalVisible(false);
    setExecutingCase(null);
    executeForm.resetFields();
    if (pollingTimer) {
      clearInterval(pollingTimer);
      setPollingTimer(null);
    }
  };

  // 执行测试
  const handleExecute = async () => {
    try {
      const values = await executeForm.validateFields();
      const data = {
        case_id: executingCase.id,
        environment: values.environment,
        username: values.username,
        password: values.password,
      };

      const response = await runTest(data);
      message.success('测试已开始执行，完成后将自动显示结果');

      const taskId = response.data?.task_id;
      if (taskId) {
        startPolling(taskId);
      }

      handleCloseExecuteModal();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('执行失败');
        console.error(error);
      }
    }
  };

  // 计算执行时长
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '-';
    const diff = (new Date(endTime) - new Date(startTime)) / 1000;
    return `${diff.toFixed(2)}s`;
  };

  // 开始轮询任务状态
  const startPolling = (taskId) => {
    let pollCount = 0;
    const maxPolls = 15; // 最多轮询 3 次

    const timer = setInterval(async () => {
      try {
        pollCount++;

        // 超时保护
        if (pollCount > maxPolls) {
          console.log('轮询次数已达上限，停止轮询');
          clearInterval(timer);
          setPollingTimer(null);
          message.warning('轮询次数已达上限，请手动刷新查看结果');
          return;
        }

        const response = await getTaskResult(taskId);
        const taskData = response.data;

        console.log(`轮询结果 (${pollCount}/${maxPolls}):`, taskData);

        if (taskData.task.status === 'success' || taskData.task.status === 'failed') {
          console.log('测试完成，停止轮询');
          clearInterval(timer);
          setPollingTimer(null);

          setTestResult({
            task_id: taskData.task.id,
            case_name: taskData.task.case_name,
            status: taskData.task.status,
            start_time: taskData.task.start_time,
            end_time: taskData.task.end_time,
            duration: calculateDuration(taskData.task.start_time, taskData.task.end_time),
            steps: (taskData.steps || []).map(step => ({
              step: step.step_order,
              action: step.action,
              description: step.description || '',
              status: step.status,
              screenshot: step.screenshot_url,
            })),
            error: taskData.task.report?.error || null,
            logs: JSON.stringify(taskData.task.report, null, 2),
          });
          setResultDrawerVisible(true);

          if (taskData.task.status === 'success') {
            message.success('测试执行完成');
          } else {
            message.error('测试执行失败');
          }
        } else {
          console.log('测试进行中，状态:', taskData.task.status);
        }
      } catch (error) {
        console.error('轮询状态失败:', error);
        // 如果连续失败多次，停止轮询
        if (pollCount > 5) {
          clearInterval(timer);
          setPollingTimer(null);
          message.error('获取测试状态失败，请检查后端服务');
        }
      }
    }, 2000);

    setPollingTimer(timer);
  };

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
    };
  }, [pollingTimer]);

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '测试类型',
      dataIndex: 'test_type',
      key: 'test_type',
      width: 120,
      render: (type) => {
        const typeMap = {
          ui: { color: 'blue', text: 'UI测试' },
          api: { color: 'green', text: 'API测试' },
          performance: { color: 'orange', text: '性能测试' },
          security: { color: 'red', text: '安全测试' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
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
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags) => (
        <>
          {tags && tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleOpenExecuteModal(record)}
          >
            执行
          </Button>
          <Popconfirm
            title="确定要删除这个测试用例吗？"
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
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>测试用例管理</h1>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline" onFinish={handleSearch}>
          <Form.Item name="name">
            <Input
              placeholder="用例名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="test_type">
            <Select placeholder="测试类型" style={{ width: 150 }} allowClear>
              <Option value="ui">UI测试</Option>
              <Option value="api">API测试</Option>
              <Option value="performance">性能测试</Option>
              <Option value="security">安全测试</Option>
            </Select>
          </Form.Item>
          <Form.Item name="environment">
            <Select placeholder="环境" style={{ width: 120 }} allowClear>
              <Option value="dev">开发</Option>
              <Option value="test">测试</Option>
              <Option value="staging">预发</Option>
              <Option value="prod">生产</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作按钮 + 表格 */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            新增测试用例
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={testCases}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCase ? '编辑测试用例' : '新增测试用例'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用例名称"
            name="name"
            rules={[{ required: true, message: '请输入用例名称' }]}
          >
            <Input placeholder="请输入用例名称" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            label="测试类型"
            name="test_type"
            rules={[{ required: true, message: '请选择测试类型' }]}
          >
            <Select placeholder="请选择测试类型">
              <Option value="ui">UI测试</Option>
              <Option value="api">API测试</Option>
              <Option value="performance">性能测试</Option>
              <Option value="security">安全测试</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="环境"
            name="environment"
            rules={[{ required: true, message: '请选择环境' }]}
          >
            <Select placeholder="请选择环境">
              <Option value="dev">开发</Option>
              <Option value="test">测试</Option>
              <Option value="staging">预发</Option>
              <Option value="prod">生产</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="测试步骤 (JSON格式)"
            name="steps"
            rules={[
              { required: true, message: '请输入测试步骤' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch (e) {
                    return Promise.reject(new Error('JSON 格式错误'));
                  }
                },
              },
            ]}
            extra='示例: [{"step": 1, "action": "打开页面", "url": "https://example.com"}]'
          >
            <TextArea
              rows={8}
              placeholder='[{"step": 1, "action": "打开页面", "url": "https://example.com"}]'
            />
          </Form.Item>

          <Form.Item label="标签" name="tags">
            <Select mode="tags" placeholder="请输入标签，按回车添加" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 执行测试弹窗 */}
      <Modal
        title="执行测试"
        open={executeModalVisible}
        onOk={handleExecute}
        onCancel={handleCloseExecuteModal}
        okText="执行"
        cancelText="取消"
      >
        <Form form={executeForm} layout="vertical">
          <Form.Item label="测试用例">
            <Input value={executingCase?.name} disabled />
          </Form.Item>

          <Form.Item
            label="环境"
            name="environment"
            rules={[{ required: true, message: '请选择环境' }]}
          >
            <Select placeholder="请选择环境">
              <Option value="dev">开发</Option>
              <Option value="test">测试</Option>
              <Option value="staging">预发</Option>
              <Option value="prod">生产</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试结果抽屉 */}
      <Drawer
        title="测试执行结果"
        placement="right"
        size="large"
        open={resultDrawerVisible}
        onClose={() => setResultDrawerVisible(false)}
      >
        {testResult ? (
          <div>
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <p><strong>任务ID:</strong> {testResult.task_id}</p>
              <p><strong>用例名称:</strong> {testResult.case_name}</p>
              <p>
                <strong>状态:</strong>{' '}
                <Tag color={testResult.status === 'success' ? 'success' : 'error'}>
                  {testResult.status === 'success' ? '成功' : '失败'}
                </Tag>
              </p>
              <p><strong>开始时间:</strong> {testResult.start_time}</p>
              <p><strong>结束时间:</strong> {testResult.end_time}</p>
              <p><strong>耗时:</strong> {testResult.duration}</p>
            </Card>

            {testResult.steps?.length > 0 && (
              <Card title="执行步骤" style={{ marginBottom: 16 }}>
                <Steps
                  orientation="vertical"
                  current={testResult.steps.length}
                  status={testResult.status === 'success' ? 'finish' : 'error'}
                >
                  {testResult.steps.map((step, index) => (
                    <Steps.Step
                      key={index}
                      title={`步骤 ${step.step}: ${step.action}`}
                      description={
                        <div>
                          <p>{step.description}</p>
                          {step.status && (
                            <Tag color={step.status === 'success' ? 'success' : 'error'}>
                              {step.status === 'success' ? '成功' : '失败'}
                            </Tag>
                          )}
                          {step.screenshot && (
                            <div style={{ marginTop: 8 }}>
                              <Image
                                width={200}
                                src={step.screenshot}
                                alt={`步骤${step.step}截图`}
                              />
                            </div>
                          )}
                        </div>
                      }
                      status={step.status === 'success' ? 'finish' : 'error'}
                    />
                  ))}
                </Steps>
              </Card>
            )}

            {testResult.error && (
              <Card title="错误信息" style={{ marginBottom: 16 }}>
                <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
                  {testResult.error}
                </pre>
              </Card>
            )}

            {testResult.logs && (
              <Card title="执行日志">
                <pre style={{ maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  {testResult.logs}
                </pre>
              </Card>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin tip="加载中..." />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TestCaseManagement;
