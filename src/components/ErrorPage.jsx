import { useRouteError, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('路由错误:', error);

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return {
        status: '404',
        title: '404',
        subTitle: '抱歉，您访问的页面不存在',
      };
    }

    if (error?.status === 403) {
      return {
        status: '403',
        title: '403',
        subTitle: '抱歉，您没有权限访问此页面',
      };
    }

    return {
      status: 'error',
      title: '出错了',
      subTitle: error?.message || '抱歉，页面加载出现问题',
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Result
        status={errorInfo.status}
        title={errorInfo.title}
        subTitle={errorInfo.subTitle}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            返回首页
          </Button>,
          <Button key="back" onClick={() => navigate(-1)}>
            返回上一页
          </Button>,
        ]}
      />
    </div>
  );
};

export default ErrorPage;
