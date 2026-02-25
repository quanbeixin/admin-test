import { Form, Input, Button, Checkbox, Card, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { login, register } from '../api/user';

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await login({
        username: values.username,
        password: values.password,
      });

      // 保存 token 和用户信息
      const token = response.token || response.data?.token;
      const userInfo = response.userInfo || response.data?.userInfo;

      if (token) {
        localStorage.setItem('token', token);

        // 保存用户信息，如果后端没有返回完整的 userInfo，至少保存用户名
        if (userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } else {
          // 如果后端没有返回 userInfo，使用登录时输入的用户名
          localStorage.setItem('userInfo', JSON.stringify({ username: values.username }));
        }

        message.success('登录成功！');
        navigate('/');
      } else {
        message.error('登录失败，未获取到 token');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开注册弹窗
  const handleOpenRegister = () => {
    setIsRegisterModalOpen(true);
  };

  // 关闭注册弹窗
  const handleCancelRegister = () => {
    setIsRegisterModalOpen(false);
    registerForm.resetFields();
  };

  // 提交注册
  const handleRegisterSubmit = async () => {
    setRegisterLoading(true);
    try {
      const values = await registerForm.validateFields();
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });

      message.success('注册成功！请登录');
      setIsRegisterModalOpen(false);
      registerForm.resetFields();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error(error.response?.data?.message || '注册失败，请稍后重试');
        console.error('注册失败:', error);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>项目管理系统</h1>
          <p style={{ color: '#666' }}>欢迎登录</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6位！' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a href="#" style={{ color: '#1890ff' }}>忘记密码？</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#666' }}>
            还没有账号？ <a onClick={handleOpenRegister} style={{ color: '#1890ff', cursor: 'pointer' }}>立即注册</a>
          </div>
        </Form>
      </Card>

      <Modal
        title="用户注册"
        open={isRegisterModalOpen}
        onOk={handleRegisterSubmit}
        onCancel={handleCancelRegister}
        okText="注册"
        cancelText="取消"
        confirmLoading={registerLoading}
      >
        <Form
          form={registerForm}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 1, message: '用户名至少1位！' },
              { max: 20, message: '用户名最多20位！' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6位！' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
