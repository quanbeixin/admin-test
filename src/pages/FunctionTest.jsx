import { Card, Form, Input, Button, Select, message, Space, Divider, Alert } from 'antd';
import { SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import request from '../api/request';

const { TextArea } = Input;

const FunctionTest = () => {
  const [textForm] = Form.useForm();
  const [richForm] = Form.useForm();
  const [cardForm] = Form.useForm();
  const [loading, setLoading] = useState({});
  const [testResult, setTestResult] = useState(null);

  // 测试连接
  const handleTestConnection = async () => {
    setLoading({ ...loading, test: true });
    try {
      const response = await request({
        url: '/feishu/test',
        method: 'get'
      });
      message.success('飞书连接正常');
      setTestResult(response);
    } catch (error) {
      message.error('飞书连接失败');
      console.error('测试连接失败:', error);
    } finally {
      setLoading({ ...loading, test: false });
    }
  };

  // 发送文本消息
  const handleSendText = async () => {
    try {
      const values = await textForm.validateFields();
      setLoading({ ...loading, text: true });

      await request({
        url: '/feishu/send',
        method: 'post',
        data: {
          targetId: values.targetId,
          type: values.type,
          content: values.content,
          msgType: 'text'
        }
      });

      message.success('文本消息发送成功');
      textForm.resetFields();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('发送失败');
        console.error('发送失败:', error);
      }
    } finally {
      setLoading({ ...loading, text: false });
    }
  };

  // 发送富文本消息
  const handleSendRich = async () => {
    try {
      const values = await richForm.validateFields();
      setLoading({ ...loading, rich: true });

      await request({
        url: '/feishu/send-rich',
        method: 'post',
        data: {
          targetId: values.targetId,
          type: values.type,
          content: JSON.parse(values.content)
        }
      });

      message.success('富文本消息发送成功');
      richForm.resetFields();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('发送失败');
        console.error('发送失败:', error);
      }
    } finally {
      setLoading({ ...loading, rich: false });
    }
  };

  // 发送卡片消息
  const handleSendCard = async () => {
    try {
      const values = await cardForm.validateFields();
      setLoading({ ...loading, card: true });

      await request({
        url: '/feishu/send-card',
        method: 'post',
        data: {
          targetId: values.targetId,
          type: values.type,
          card: JSON.parse(values.card)
        }
      });

      message.success('卡片消息发送成功');
      cardForm.resetFields();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('发送失败');
        console.error('发送失败:', error);
      }
    } finally {
      setLoading({ ...loading, card: false });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="飞书消息测试" style={{ marginBottom: 24 }}>
        <Alert
          message="测试说明"
          description="在发送消息前，请先测试飞书连接是否正常。targetId 可以是群聊 ID 或用户 Open ID。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={loading.test}
          onClick={handleTestConnection}
        >
          测试飞书连接
        </Button>

        {testResult && (
          <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
            <div>✓ 连接成功</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Token: {testResult.token}</div>
          </div>
        )}
      </Card>

      <Card title="发送文本消息" style={{ marginBottom: 24 }}>
        <Form form={textForm} layout="vertical">
          <Form.Item
            label="接收方 ID"
            name="targetId"
            rules={[{ required: true, message: '请输入接收方 ID' }]}
            extra="群聊 ID 或用户 Open ID"
          >
            <Input placeholder="请输入接收方 ID" />
          </Form.Item>

          <Form.Item
            label="接收方类型"
            name="type"
            rules={[{ required: true, message: '请选择接收方类型' }]}
          >
            <Select placeholder="请选择接收方类型">
              <Select.Option value="chat_id">群聊</Select.Option>
              <Select.Option value="open_id">用户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="消息内容"
            name="content"
            rules={[{ required: true, message: '请输入消息内容' }]}
          >
            <TextArea rows={4} placeholder="请输入消息内容" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading.text}
              onClick={handleSendText}
            >
              发送文本消息
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="发送富文本消息" style={{ marginBottom: 24 }}>
        <Form form={richForm} layout="vertical">
          <Form.Item
            label="接收方 ID"
            name="targetId"
            rules={[{ required: true, message: '请输入接收方 ID' }]}
          >
            <Input placeholder="请输入接收方 ID" />
          </Form.Item>

          <Form.Item
            label="接收方类型"
            name="type"
            rules={[{ required: true, message: '请选择接收方类型' }]}
          >
            <Select placeholder="请选择接收方类型">
              <Select.Option value="chat_id">群聊</Select.Option>
              <Select.Option value="open_id">用户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="富文本内容 (JSON)"
            name="content"
            rules={[{ required: true, message: '请输入富文本内容' }]}
            extra="请输入符合飞书富文本格式的 JSON"
          >
            <TextArea
              rows={8}
              placeholder='{"title":"标题","content":[[{"tag":"text","text":"内容"}]]}'
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading.rich}
              onClick={handleSendRich}
            >
              发送富文本消息
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="发送卡片消息">
        <Form form={cardForm} layout="vertical">
          <Form.Item
            label="接收方 ID"
            name="targetId"
            rules={[{ required: true, message: '请输入接收方 ID' }]}
          >
            <Input placeholder="请输入接收方 ID" />
          </Form.Item>

          <Form.Item
            label="接收方类型"
            name="type"
            rules={[{ required: true, message: '请选择接收方类型' }]}
          >
            <Select placeholder="请选择接收方类型">
              <Select.Option value="chat_id">群聊</Select.Option>
              <Select.Option value="open_id">用户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="卡片内容 (JSON)"
            name="card"
            rules={[{ required: true, message: '请输入卡片内容' }]}
            extra="请输入符合飞书卡片格式的 JSON"
          >
            <TextArea
              rows={10}
              placeholder='{"header":{"title":{"tag":"plain_text","content":"标题"}},"elements":[{"tag":"div","text":{"tag":"plain_text","content":"内容"}}]}'
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading.card}
              onClick={handleSendCard}
            >
              发送卡片消息
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FunctionTest;
