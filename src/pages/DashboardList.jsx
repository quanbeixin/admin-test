import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Modal, Form, Input, message, Popconfirm, Select, Checkbox, InputNumber, Flex } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDashboards, createDashboard, deleteDashboard, getFields } from '../api/dashboard';
import mockData from '../data/mockData.json';

const DashboardList = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fields, setFields] = useState([]);
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboards();
    loadFields();
  }, []);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const response = await getDashboards();
      setDashboards(response.data || []);
    } catch (error) {
      message.error('加载仪表盘列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFields = async () => {
    try {
      const response = await getFields();
      setFields(response.data || []);
    } catch (error) {
      console.error('加载字段失败:', error);
    }
  };

  const chartTypes = [
    { value: 'bar', label: '柱状图', icon: '📊' },
    { value: 'line', label: '折线图', icon: '📈' },
    { value: 'pie', label: '饼图', icon: '🥧' },
    { value: 'table', label: '数据表格', icon: '📋' }
  ];

  const handleCreate = async (values) => {
    try {
      // 构建布局配置
      const layout = selectedCharts.map((chart, index) => ({
        i: chart.id,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 8,
        w: 6,
        h: 8,
        minW: 4,
        minH: 6,
        title: chart.title
      }));

      // 构建图表配置
      const chartsConfig = {};
      selectedCharts.forEach(chart => {
        chartsConfig[chart.id] = {
          type: chart.type,
          title: chart.title,
          xField: chart.xField || 'date',
          yField: chart.yField || 'sales',
          yLabel: chart.yLabel || '数值',
          categoryField: chart.categoryField || 'category',
          valueField: chart.valueField || 'sales',
          fields: chart.fields || [],
          fieldLabels: chart.fieldLabels || {},
          color: chart.color || '#5470c6'
        };
      });

      await createDashboard({
        name: values.name,
        description: values.description,
        layout: layout,
        config: {
          charts: chartsConfig,
          data: mockData  // 使用 mockData 作为默认数据
        }
      });

      message.success('创建成功');
      setModalVisible(false);
      setCurrentStep(0);
      setSelectedCharts([]);
      form.resetFields();
      loadDashboards();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleAddChart = (type) => {
    const chartId = `chart_${Date.now()}`;
    const newChart = {
      id: chartId,
      type: type,
      title: chartTypes.find(t => t.value === type)?.label || '图表',
      xField: 'date',
      yField: type === 'bar' ? 'sales' : 'profit',
      yLabel: type === 'bar' ? '销售额' : '利润',
      categoryField: 'category',
      valueField: 'sales',
      fields: ['date', 'sales', 'profit', 'category'],
      fieldLabels: {
        date: '日期',
        sales: '销售额',
        profit: '利润',
        category: '分类'
      }
    };
    setSelectedCharts([...selectedCharts, newChart]);
  };

  const handleRemoveChart = (chartId) => {
    setSelectedCharts(selectedCharts.filter(c => c.id !== chartId));
  };

  const handleUpdateChart = (chartId, field, value) => {
    setSelectedCharts(selectedCharts.map(c =>
      c.id === chartId ? { ...c, [field]: value } : c
    ));
  };

  const handleDelete = async (id) => {
    try {
      await deleteDashboard(id);
      message.success('删除成功');
      loadDashboards();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleView = (id) => {
    navigate(`/dashboard/${id}`);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-'
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这个仪表盘吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入仪表盘名称' }]}
          >
            <Input placeholder="请输入仪表盘名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入仪表盘描述" rows={4} />
          </Form.Item>
        </>
      );
    }

    if (currentStep === 1) {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h4>选择图表类型</h4>
            <Space wrap>
              {chartTypes.map(type => (
                <Button
                  key={type.value}
                  onClick={() => handleAddChart(type.value)}
                  icon={<span>{type.icon}</span>}
                >
                  添加{type.label}
                </Button>
              ))}
            </Space>
          </div>

          <div>
            <h4>已选图表 ({selectedCharts.length})</h4>
            {selectedCharts.length === 0 ? (
              <p style={{ color: '#999' }}>请至少添加一个图表</p>
            ) : (
              <Flex vertical gap="middle" style={{ width: '100%' }}>
                {selectedCharts.map(chart => (
                  <Card
                    key={chart.id}
                    size="small"
                    title={`${chartTypes.find(t => t.value === chart.type)?.icon} ${chart.title}`}
                    extra={
                      <Button
                        type="link"
                        danger
                        size="small"
                        onClick={() => handleRemoveChart(chart.id)}
                      >
                        删除
                      </Button>
                    }
                  >
                    <Flex vertical gap="small" style={{ width: '100%' }}>
                      <Input
                        placeholder="图表标题"
                        value={chart.title}
                        onChange={(e) => handleUpdateChart(chart.id, 'title', e.target.value)}
                      />
                      {(chart.type === 'bar' || chart.type === 'line') && (
                        <>
                          <Select
                            placeholder="X轴字段"
                            value={chart.xField}
                            onChange={(value) => handleUpdateChart(chart.id, 'xField', value)}
                            style={{ width: '100%' }}
                            options={fields.map(f => ({ label: f.label, value: f.name }))}
                          />
                          <Select
                            placeholder="Y轴字段"
                            value={chart.yField}
                            onChange={(value) => handleUpdateChart(chart.id, 'yField', value)}
                            style={{ width: '100%' }}
                            options={fields.map(f => ({ label: f.label, value: f.name }))}
                          />
                        </>
                      )}
                      {chart.type === 'pie' && (
                        <>
                          <Select
                            placeholder="分类字段"
                            value={chart.categoryField}
                            onChange={(value) => handleUpdateChart(chart.id, 'categoryField', value)}
                            style={{ width: '100%' }}
                            options={fields.map(f => ({ label: f.label, value: f.name }))}
                          />
                          <Select
                            placeholder="数值字段"
                            value={chart.valueField}
                            onChange={(value) => handleUpdateChart(chart.id, 'valueField', value)}
                            style={{ width: '100%' }}
                            options={fields.map(f => ({ label: f.label, value: f.name }))}
                          />
                        </>
                      )}
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <Card
        title="仪表盘管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            创建仪表盘
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dashboards}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title="创建仪表盘"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setCurrentStep(0);
          setSelectedCharts([]);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            setCurrentStep(0);
            setSelectedCharts([]);
            form.resetFields();
          }}>
            取消
          </Button>,
          currentStep > 0 && (
            <Button key="prev" onClick={() => setCurrentStep(0)}>
              上一步
            </Button>
          ),
          currentStep === 0 ? (
            <Button key="next" type="primary" onClick={() => setCurrentStep(1)}>
              下一步
            </Button>
          ) : (
            <Button
              key="submit"
              type="primary"
              onClick={() => form.submit()}
              disabled={selectedCharts.length === 0}
            >
              创建
            </Button>
          )
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          {renderStepContent()}
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardList;
