import { Form, Input, Button, Switch, Card, message } from 'antd';

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('表单值:', values);
    message.success('设置保存成功！');
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>系统设置</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            siteName: '后台管理系统',
            siteUrl: 'https://example.com',
            email: 'admin@example.com',
            enableNotifications: true,
            enableMaintenance: false,
          }}
        >
          <Form.Item
            label="网站名称"
            name="siteName"
            rules={[{ required: true, message: '请输入网站名称' }]}
          >
            <Input placeholder="请输入网站名称" />
          </Form.Item>

          <Form.Item
            label="网站地址"
            name="siteUrl"
            rules={[
              { required: true, message: '请输入网站地址' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input placeholder="请输入网站地址" />
          </Form.Item>

          <Form.Item
            label="管理员邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入管理员邮箱" />
          </Form.Item>

          <Form.Item
            label="启用通知"
            name="enableNotifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="维护模式"
            name="enableMaintenance"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
