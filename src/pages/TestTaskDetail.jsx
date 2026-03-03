import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Steps, Button, Image, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getTaskDetail } from '../api/testCase';

const TestTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState(null);

  // 加载任务详情
  const loadTaskDetail = async () => {
    setLoading(true);
    try {
      const response = await getTaskDetail(id);
      setTaskData(response.data);
    } catch (error) {
      message.error('加载任务详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" description="加载中..." />
      </div>
    );
  }

  if (!taskData) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <p>任务不存在</p>
        <Button onClick={() => navigate('/test-tasks')}>返回列表</Button>
      </div>
    );
  }

  const { task, case: testCase, steps } = taskData;

  // 状态配置
  const statusMap = {
    running: { color: 'processing', text: '执行中' },
    success: { color: 'success', text: '成功' },
    failed: { color: 'error', text: '失败' },
  };

  const envMap = {
    dev: { color: 'cyan', text: '开发' },
    test: { color: 'blue', text: '测试' },
    staging: { color: 'orange', text: '预发' },
    prod: { color: 'red', text: '生产' },
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/test-tasks')}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <h1 style={{ margin: 0 }}>测试任务详情</h1>
      </div>

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="任务ID">{task.id}</Descriptions.Item>
          <Descriptions.Item label="测试用例">
            {testCase?.name || task.case_id}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusMap[task.status]?.color || 'default'}>
              {statusMap[task.status]?.text || task.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="环境">
            <Tag color={envMap[task.environment]?.color || 'default'}>
              {envMap[task.environment]?.text || task.environment}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {task.start_time ? new Date(task.start_time).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {task.end_time ? new Date(task.end_time).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="执行时长">
            {task.execution_time ? `${task.execution_time}秒` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="触发人">
            {task.triggered_by || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 测试用例信息 */}
      {testCase && (
        <Card title="测试用例信息" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="用例名称">{testCase.name}</Descriptions.Item>
            <Descriptions.Item label="描述">
              {testCase.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="测试类型">
              {testCase.test_type || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 执行报告 */}
      {task.report && (
        <Card title="执行报告" style={{ marginBottom: 16 }}>
          <Descriptions column={3} bordered>
            <Descriptions.Item label="总步骤数">
              {task.report.total_steps || 0}
            </Descriptions.Item>
            <Descriptions.Item label="成功步骤">
              <span style={{ color: '#52c41a' }}>
                {task.report.success_steps || 0}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="失败步骤">
              <span style={{ color: '#ff4d4f' }}>
                {task.report.failed_steps || 0}
              </span>
            </Descriptions.Item>
          </Descriptions>

          {task.report.error && (
            <div style={{ marginTop: 16 }}>
              <h4>错误信息：</h4>
              <pre style={{
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                padding: 12,
                borderRadius: 4,
                color: '#ff4d4f'
              }}>
                {task.report.error}
                {task.report.details && `\n详情: ${task.report.details}`}
              </pre>
            </div>
          )}

          {task.report.failed_step_details && task.report.failed_step_details.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>失败步骤详情：</h4>
              {task.report.failed_step_details.map((detail, index) => (
                <div key={index} style={{
                  background: '#fff2f0',
                  border: '1px solid #ffccc7',
                  padding: 12,
                  borderRadius: 4,
                  marginBottom: 8
                }}>
                  <p><strong>步骤 {detail.step_order}:</strong> {detail.action}</p>
                  <p style={{ color: '#ff4d4f', margin: 0 }}>错误: {detail.error}</p>
                </div>
              ))}
            </div>
          )}

          {task.log && (
            <div style={{ marginTop: 16 }}>
              <h4>执行日志：</h4>
              <pre style={{
                background: '#f5f5f5',
                border: '1px solid #d9d9d9',
                padding: 12,
                borderRadius: 4,
                maxHeight: 400,
                overflow: 'auto',
                fontSize: 12,
                lineHeight: 1.5
              }}>
                {typeof task.log === 'string' ? task.log : JSON.stringify(task.log, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}

      {/* 执行步骤 */}
      <Card title="执行步骤">
        {steps && steps.length > 0 ? (
          <Steps
            direction="vertical"
            current={steps.length}
            status={task.status === 'success' ? 'finish' : task.status === 'failed' ? 'error' : 'process'}
            items={steps.map((step, index) => ({
              title: `步骤 ${step.step_order}: ${step.action}`,
              description: (
                <div>
                  {step.selector && (
                    <p style={{ margin: '4px 0' }}>
                      <strong>选择器:</strong> {step.selector}
                    </p>
                  )}
                  {step.value && (
                    <p style={{ margin: '4px 0' }}>
                      <strong>值:</strong> {step.value}
                    </p>
                  )}
                  {step.description && (
                    <p style={{ margin: '4px 0' }}>{step.description}</p>
                  )}
                  <p style={{ margin: '4px 0' }}>
                    <strong>状态:</strong>{' '}
                    <Tag color={step.status === 'success' ? 'success' : 'error'}>
                      {step.status === 'success' ? '成功' : '失败'}
                    </Tag>
                  </p>
                  {step.error && (
                    <p style={{ margin: '4px 0', color: '#ff4d4f' }}>
                      <strong>错误:</strong> {step.error}
                    </p>
                  )}
                  {step.executed_at && (
                    <p style={{ margin: '4px 0', color: '#999', fontSize: 12 }}>
                      执行时间: {new Date(step.executed_at).toLocaleString('zh-CN')}
                    </p>
                  )}
                  {step.screenshot && (
                    <div style={{ marginTop: 8 }}>
                      <Image
                        width={200}
                        src={step.screenshot}
                        alt={`步骤${step.step_order}截图`}
                        placeholder={
                          <div style={{
                            width: 200,
                            height: 150,
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            加载中...
                          </div>
                        }
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      />
                    </div>
                  )}
                </div>
              ),
              status: step.status === 'success' ? 'finish' : 'error',
            }))}
          />
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            暂无步骤记录
          </p>
        )}
      </Card>
    </div>
  );
};

export default TestTaskDetail;
