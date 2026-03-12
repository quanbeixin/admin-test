import { Card, Row, Col, Statistic, Table, DatePicker, Select, Spin } from 'antd';
import { UserOutlined, MessageOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { useState, useEffect } from 'react';
import { getAllFeedback } from '../api/feedback';
import dayjs from 'dayjs';
import './FeedbackDashboard.css';

const { RangePicker } = DatePicker;

const FeedbackDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [selectedProduct, setSelectedProduct] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await getAllFeedback();
      const data = response.data || response;
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('获取反馈数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤数据
  const filteredData = feedbackList.filter(item => {
    const itemDate = dayjs(item.date);
    const inDateRange = itemDate.isAfter(dateRange[0]) && itemDate.isBefore(dateRange[1]);
    const matchProduct = selectedProduct === 'all' || item.product === selectedProduct;
    return inDateRange && matchProduct;
  });

  // 统计数据
  const stats = {
    total: filteredData.length,
    processed: filteredData.filter(item => item.status === 'processed').length,
    pending: filteredData.filter(item => item.status === 'pending').length,
    aiProcessed: filteredData.filter(item => item.ai_processed).length
  };

  // 按产品分组统计
  const productStats = {};
  filteredData.forEach(item => {
    if (!productStats[item.product]) {
      productStats[item.product] = { total: 0, processed: 0, pending: 0 };
    }
    productStats[item.product].total++;
    if (item.status === 'processed') {
      productStats[item.product].processed++;
    } else {
      productStats[item.product].pending++;
    }
  });

  const productTableData = Object.keys(productStats).map(product => ({
    product,
    ...productStats[product],
    processRate: ((productStats[product].processed / productStats[product].total) * 100).toFixed(1)
  }));

  // 按分类统计
  const categoryStats = {};
  filteredData.forEach(item => {
    const category = item.ai_category || '未分类';
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });

  console.log('分类统计:', categoryStats);
  console.log('示例数据:', filteredData[0]);

  const categoryTableData = Object.keys(categoryStats).map(category => ({
    category,
    count: categoryStats[category],
    percentage: ((categoryStats[category] / filteredData.length) * 100).toFixed(1)
  }));

  // 饼图数据
  const pieData = Object.keys(categoryStats).map(category => ({
    type: category,
    value: categoryStats[category]
  }));

  // 生成颜色
  const colors = [
    '#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E86452',
    '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3',
    '#8B5CFF', '#00D9C9', '#FFAA15', '#FF6B9D', '#C23531'
  ];

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    color: colors,
    radius: 0.9,
    innerRadius: 0.64,
    label: false,
    legend: false,
    height: 400,
    statistic: {
      title: {
        style: {
          fontSize: '14px',
          color: '#999'
        },
        content: '总计'
      },
      content: {
        style: {
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1a1a1a'
        },
        content: filteredData.length.toString()
      }
    },
    tooltip: {
      title: (d) => d.type,
      items: [
        {
          field: 'value',
          name: '数量'
        }
      ]
    }
  };

  // 按情绪统计
  const sentimentStats = {
    Positive: filteredData.filter(item => item.ai_sentiment === 'Positive').length,
    Neutral: filteredData.filter(item => item.ai_sentiment === 'Neutral').length,
    Negative: filteredData.filter(item => item.ai_sentiment === 'Negative').length
  };

  // 获取产品列表
  const products = ['all', ...new Set(feedbackList.map(item => item.product).filter(Boolean))];

  const productColumns = [
    { title: '产品', dataIndex: 'product', key: 'product' },
    { title: '总数', dataIndex: 'total', key: 'total' },
    { title: '已处理', dataIndex: 'processed', key: 'processed' },
    { title: '待处理', dataIndex: 'pending', key: 'pending' },
    {
      title: '处理率',
      dataIndex: 'processRate',
      key: 'processRate',
      render: (rate) => `${rate}%`
    }
  ];

  const categoryColumns = [
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '数量', dataIndex: 'count', key: 'count' },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage}%`
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="YYYY-MM-DD"
        />
        <Select
          style={{ width: 200 }}
          value={selectedProduct}
          onChange={setSelectedProduct}
          placeholder="选择产品"
        >
          <Select.Option value="all">全部产品</Select.Option>
          {products.filter(p => p !== 'all').map(product => (
            <Select.Option key={product} value={product}>{product}</Select.Option>
          ))}
        </Select>
      </div>

      <Spin spinning={loading}>
        {/* 概览卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="反馈总数"
                value={stats.total}
                prefix={<MessageOutlined />}
                styles={{ value: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="已处理"
                value={stats.processed}
                prefix={<CheckCircleOutlined />}
                styles={{ value: { color: '#52c41a' } }}
                suffix={`/ ${stats.total}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="待处理"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                styles={{ value: { color: '#faad14' } }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="AI 已分析"
                value={stats.aiProcessed}
                prefix={<UserOutlined />}
                styles={{ value: { color: '#722ed1' } }}
                suffix={`/ ${stats.total}`}
              />
            </Card>
          </Col>
        </Row>

        {/* AI 分类饼图 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="问题类型占比" className="pie-chart-card">
              <Row>
                <Col span={10}>
                  <div className="category-list">
                    {categoryTableData.map((item, index) => (
                      <div
                        key={item.category}
                        className="category-item"
                        style={{
                          borderLeftColor: colors[index % colors.length]
                        }}
                      >
                        <div className="category-item-left">
                          <div
                            className="category-dot"
                            style={{
                              backgroundColor: colors[index % colors.length]
                            }}
                          />
                          <span className="category-name">{item.category}</span>
                        </div>
                        <div className="category-stats">
                          <span className="category-count">{item.count}</span>
                          <span className="category-percentage">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col span={14}>
                  <div className="pie-chart-container">
                    <Pie {...pieConfig} />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* 产品统计 */}
        <Row gutter={16}>
          <Col span={24}>
            <Card title="产品反馈统计">
              <Table
                dataSource={productTableData}
                columns={productColumns}
                pagination={false}
                rowKey="product"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default FeedbackDashboard;
