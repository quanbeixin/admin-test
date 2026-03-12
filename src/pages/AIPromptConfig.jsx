import { Card, Form, Input, Button, message, Spin, Tabs } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getAIPromptConfig, updateAIPromptConfig } from '../api/aiConfig';

const { TextArea } = Input;

const AIPromptConfig = () => {
  const [systemForm] = Form.useForm();
  const [knowledgeForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [styleForm] = Form.useForm();
  const [limitForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [config, setConfig] = useState({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await getAIPromptConfig();
      const data = response.data || response;
      setConfig(data);

      systemForm.setFieldsValue({ systemPrompt: data.systemPrompt || '' });
      knowledgeForm.setFieldsValue({ knowledgeBase: data.knowledgeBase || '' });
      categoryForm.setFieldsValue({ categories: data.categories || '' });
      styleForm.setFieldsValue({ replyStyle: data.replyStyle || '' });
      limitForm.setFieldsValue({ limitations: data.limitations || '' });
    } catch (error) {
      message.error('获取配置失败');
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type, form) => {
    try {
      const values = await form.validateFields();
      setSaving({ ...saving, [type]: true });

      const updatedConfig = { ...config, ...values };
      await updateAIPromptConfig(updatedConfig);
      setConfig(updatedConfig);

      message.success('配置保存成功');
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('保存失败');
        console.error('保存失败:', error);
      }
    } finally {
      setSaving({ ...saving, [type]: false });
    }
  };

  const tabItems = [
    {
      key: 'system',
      label: '系统角色定义',
      children: (
        <Spin spinning={loading}>
          <Form form={systemForm} layout="vertical">
            <Form.Item
              label="系统角色定义"
              name="systemPrompt"
              rules={[{ required: true, message: '请输入系统角色定义' }]}
              extra="定义 AI 的角色和基本能力"
            >
              <TextArea
                rows={12}
                placeholder="例如：你是一位专业且富有同理心的客服专员..."
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving.system}
                onClick={() => handleSave('system', systemForm)}
              >
                保存配置
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )
    },
    {
      key: 'knowledge',
      label: '知识库',
      children: (
        <Spin spinning={loading}>
          <Form form={knowledgeForm} layout="vertical">
            <Form.Item
              label="知识库"
              name="knowledgeBase"
              rules={[{ required: true, message: '请输入知识库内容' }]}
              extra="提供常见问题和解决方案"
            >
              <TextArea
                rows={15}
                placeholder="例如：为什么我的账号被封禁了？- 抱歉给您带来困扰..."
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving.knowledge}
                onClick={() => handleSave('knowledge', knowledgeForm)}
              >
                保存配置
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )
    },
    {
      key: 'category',
      label: '问题分类',
      children: (
        <Spin spinning={loading}>
          <Form form={categoryForm} layout="vertical">
            <Form.Item
              label="问题分类"
              name="categories"
              rules={[{ required: true, message: '请输入问题分类' }]}
              extra="定义可选的问题分类，用逗号分隔"
            >
              <TextArea
                rows={8}
                placeholder="例如：会员订阅-未激活,会员订阅-取消订阅,功能反馈-无法生成..."
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving.category}
                onClick={() => handleSave('category', categoryForm)}
              >
                保存配置
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )
    },
    {
      key: 'style',
      label: '回复风格',
      children: (
        <Spin spinning={loading}>
          <Form form={styleForm} layout="vertical">
            <Form.Item
              label="回复风格要求"
              name="replyStyle"
              rules={[{ required: true, message: '请输入回复风格要求' }]}
              extra="定义 AI 回复的语气和风格"
            >
              <TextArea
                rows={10}
                placeholder="例如：语气亲切自然，像朋友聊天一样..."
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving.style}
                onClick={() => handleSave('style', styleForm)}
              >
                保存配置
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )
    },
    {
      key: 'limit',
      label: '限制条件',
      children: (
        <Spin spinning={loading}>
          <Form form={limitForm} layout="vertical">
            <Form.Item
              label="限制条件"
              name="limitations"
              rules={[{ required: true, message: '请输入限制条件' }]}
              extra="定义 AI 分析和回复的限制条件"
            >
              <TextArea
                rows={10}
                placeholder="例如：回复必须基于知识库内容，用户需求要简练（6字以内）..."
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving.limit}
                onClick={() => handleSave('limit', limitForm)}
              >
                保存配置
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="AI 分析 Prompt 配置"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchConfig}>
            刷新
          </Button>
        }
      >
        <Tabs items={tabItems} />

        <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <h4 style={{ marginBottom: 12 }}>配置说明：</h4>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>每个配置项可以独立保存，互不影响</li>
            <li>修改配置后，新的 AI 分析将使用更新后的 prompt</li>
            <li>建议在测试环境验证配置效果后再应用到生产环境</li>
            <li>知识库内容应定期更新，保持与实际业务同步</li>
            <li>问题分类应覆盖主要的用户反馈类型</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AIPromptConfig;
