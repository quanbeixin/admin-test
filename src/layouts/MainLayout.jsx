import { useState } from 'react';
import { Layout, Menu, theme, Dropdown, Avatar, message } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  FileImageOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api/user';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/workbench',
      icon: <DashboardOutlined />,
      label: '工作台',
    },
    {
      key: '/dashboard-list',
      icon: <BarChartOutlined />,
      label: '数据仪表盘',
    },
    {
      key: '/ad-creatives',
      icon: <FileImageOutlined />,
      label: '广告创意',
    },
    {
      key: 'ad-data-menu',
      icon: <LineChartOutlined />,
      label: '投放数据',
      children: [
        {
          key: '/ad-data-table',
          label: '投放数据表',
        },
      ],
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'automated-test-menu',
      icon: <ExperimentOutlined />,
      label: '自动化测试',
      children: [
        {
          key: '/automated-test',
          icon: <ExperimentOutlined />,
          label: '测试概览',
        },
        {
          key: '/test-case-management',
          icon: <FileTextOutlined />,
          label: '测试用例管理',
        },
        {
          key: '/test-tasks',
          icon: <UnorderedListOutlined />,
          label: '测试任务列表',
        },
      ],
    },
    {
      key: 'settings-menu',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: '/settings',
          label: '系统设置',
        },
        {
          key: '/platform-field-config',
          label: '平台字段配置',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 获取用户信息
  const getUserInfo = () => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        return JSON.parse(userInfoStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const userInfo = getUserInfo();

  // 登出
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      message.success('已退出登录');
      navigate('/login');
    }
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{
          height: 64,
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 20,
          fontWeight: 'bold',
        }}>
          {!collapsed && '后台管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: 18, marginLeft: 24, cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: 18, marginLeft: 24, cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>
          <div style={{ marginRight: 24 }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <span>{userInfo?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
