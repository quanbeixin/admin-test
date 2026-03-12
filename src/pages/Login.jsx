import { Form, Input, Button, Checkbox, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { login, register, getCurrentUser } from '../api/user';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await login({
        username: values.username,
        password: values.password,
      });

      const token = response.token || response.data?.token;
      let userInfo = response.data || response.userInfo;

      if (token) {
        localStorage.setItem('token', token);

        // 如果 userInfo 没有 role 字段，尝试获取当前用户完整信息
        if (!userInfo || userInfo.role === undefined) {
          try {
            const currentUserResponse = await getCurrentUser();
            const currentUser = currentUserResponse.data || currentUserResponse;
            if (currentUser) {
              userInfo = currentUser;
            }
          } catch (error) {
            console.error('获取用户详情失败:', error);
          }
        }

        if (userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } else {
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

  const handleOpenRegister = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCancelRegister = () => {
    setIsRegisterModalOpen(false);
    registerForm.resetFields();
  };

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
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className={`login-card ${mounted ? 'mounted' : ''}`}>
        <div className="login-card-glow"></div>

        <div className="login-header">
          <div className="logo-container">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 4L8 12L24 20L40 12L24 4Z" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 28L24 36L40 28" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 20L24 28L40 20" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logo-gradient" x1="8" y1="4" x2="40" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60a5fa"/>
                  <stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">后台管理系统</h1>
          <p className="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>

        <Form form={form} name="login" onFinish={onFinish} autoComplete="off" className="login-form">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名！' }]}>
            <div className="input-wrapper">
              <Input prefix={<UserOutlined className="input-icon" />} placeholder="用户名" size="large" className="custom-input" />
            </div>
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码！' }, { min: 6, message: '密码至少6位！' }]}>
            <div className="input-wrapper">
              <Input.Password prefix={<LockOutlined className="input-icon" />} placeholder="密码" size="large" className="custom-input" />
            </div>
          </Form.Item>

          <Form.Item>
            <div className="form-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="custom-checkbox">记住我</Checkbox>
              </Form.Item>
              <a href="#" className="forgot-link">忘记密码？</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button id="loginBtn" type="primary" htmlType="submit" block loading={loading} size="large" className="login-button">
              <span>登录</span>
            </Button>
          </Form.Item>

          <div className="register-prompt">
            还没有账号？ <a onClick={handleOpenRegister} className="register-link">立即注册</a>
          </div>
        </Form>
      </div>

      <Modal
        title={<span className="modal-title">用户注册</span>}
        open={isRegisterModalOpen}
        onOk={handleRegisterSubmit}
        onCancel={handleCancelRegister}
        okText="注册"
        cancelText="取消"
        confirmLoading={registerLoading}
        className="register-modal"
        centered
      >
        <Form form={registerForm} layout="vertical" autoComplete="off" className="register-form">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名！' }, { min: 1, message: '用户名至少1位！' }, { max: 20, message: '用户名最多20位！' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
          </Form.Item>

          <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱！' }, { type: 'email', message: '请输入有效的邮箱地址！' }]}>
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
          </Form.Item>

          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码！' }, { min: 6, message: '密码至少6位！' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>

          <Form.Item label="确认密码" name="confirmPassword" dependencies={['password']} rules={[{ required: true, message: '请确认密码！' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('两次输入的密码不一致！')); } })]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
