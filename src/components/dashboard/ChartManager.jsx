import React, { useState } from 'react';
import { Modal, Button, Space, Card, Input, Select, Form, message, Flex } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const ChartManager = ({ visible, onClose, charts, fields, onSave }) => {
  const [editingCharts, setEditingCharts] = useState(charts || []);
  const [form] = Form.useForm();

  const chartTypes = [
    { value: 'bar', label: '柱状图', icon: '📊' },
    { value: 'line', label: '折线图', icon: '📈' },
    { value: 'pie', label: '饼图', icon: '🥧' },
    { value: 'table', label: '数据表格', icon: '📋' }
  ];

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
      valueField: 'sales'
    };
    setEditingCharts([...editingCharts, newChart]);
  };

  const handleRemoveChart = (chartId) => {
    setEditingCharts(editingCharts.filter(c => c.id !== chartId));
  };

  const handleUpdateChart = (chartId, field, value) => {
    setEditingCharts(editingCharts.map(c =>
      c.id === chartId ? { ...c, [field]: value } : c
    ));
  };

  const handleSave = () => {
    if (editingCharts.length === 0) {
      message.warning('请至少添加一个图表');
      return;
    }
    onSave(editingCharts);
  };

  return (
    <Modal
      title="管理图表"
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      width={800}
      okText="保存"
      cancelText="取消"
    >
      <div>
        <div style={{ marginBottom: 16 }}>
          <h4>添加图表</h4>
          <Space wrap>
            {chartTypes.map(type => (
              <Button
                key={type.value}
                onClick={() => handleAddChart(type.value)}
                icon={<span>{type.icon}</span>}
              >
                {type.label}
              </Button>
            ))}
          </Space>
        </div>

        <div>
          <h4>图表列表 ({editingCharts.length})</h4>
          {editingCharts.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              暂无图表，请添加
            </p>
          ) : (
            <Flex vertical gap="middle" style={{ width: '100%' }}>
              {editingCharts.map(chart => (
                <Card
                  key={chart.id}
                  size="small"
                  title={
                    <Space>
                      <span>{chartTypes.find(t => t.value === chart.type)?.icon}</span>
                      <span>{chart.title}</span>
                    </Space>
                  }
                  extra={
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveChart(chart.id)}
                    >
                      删除
                    </Button>
                  }
                >
                  <Flex vertical gap="small" style={{ width: '100%' }}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input style={{ width: '80px' }} disabled value="标题" />
                      <Input
                        placeholder="图表标题"
                        value={chart.title}
                        onChange={(e) => handleUpdateChart(chart.id, 'title', e.target.value)}
                      />
                    </Space.Compact>

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
                        <Space.Compact style={{ width: '100%' }}>
                          <Input style={{ width: '100px' }} disabled value="Y轴标签" />
                          <Input
                            placeholder="Y轴标签"
                            value={chart.yLabel}
                            onChange={(e) => handleUpdateChart(chart.id, 'yLabel', e.target.value)}
                          />
                        </Space.Compact>
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

                    {chart.type === 'table' && (
                      <Select
                        mode="multiple"
                        placeholder="选择显示的字段"
                        value={chart.fields || []}
                        onChange={(value) => handleUpdateChart(chart.id, 'fields', value)}
                        style={{ width: '100%' }}
                        options={fields.map(f => ({ label: f.label, value: f.name }))}
                      />
                    )}
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ChartManager;
