import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Row, Col, Statistic, Tag, Button, message, Typography, Space, Tooltip, Table, Tabs, Image
} from 'antd';
import {
  ReloadOutlined, EyeOutlined, LikeOutlined, CommentOutlined, LinkOutlined, FireOutlined
} from '@ant-design/icons';
import { getTrendsToday } from '../api/trends';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  return num.toLocaleString();
};

const columns = [
  {
    title: '排名',
    key: 'rank',
    width: 60,
    align: 'center',
    render: (_, __, index) => (
      <span style={{
        display: 'inline-block',
        width: 28,
        height: 28,
        lineHeight: '28px',
        textAlign: 'center',
        borderRadius: '50%',
        background: index < 3 ? '#ff4d4f' : '#f0f0f0',
        color: index < 3 ? '#fff' : '#666',
        fontWeight: 'bold',
        fontSize: 13,
      }}>
        {index + 1}
      </span>
    ),
  },
  {
    title: '封面',
    dataIndex: 'image_url',
    key: 'image_url',
    width: 120,
    render: (url) => url ? (
      <Image
        src={url}
        alt="封面"
        width={72}
        height={48}
        style={{ objectFit: 'cover', borderRadius: 4 }}
        preview={{ mask: '预览' }}
      />
    ) : <Text type="secondary" style={{ fontSize: 12 }}>暂无</Text>,
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'author',
    width: 150,
    render: (text) => <Text>@{text}</Text>,
  },
  {
    title: '视频标题 / 标签',
    key: 'title',
    render: (_, record) => (
      <div>
        {record.title ? (
          <Paragraph
            ellipsis={{ rows: 2, tooltip: record.title }}
            style={{ margin: 0, fontSize: 13 }}
          >
            {record.title}
          </Paragraph>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>(无标题)</Text>
        )}
        {record.tags?.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {record.tags.slice(0, 4).map(tag => (
              <Tag key={tag} style={{ fontSize: 11, marginBottom: 2 }}>#{tag}</Tag>
            ))}
            {record.tags.length > 4 && (
              <Tooltip title={record.tags.slice(4).map(t => `#${t}`).join(' ')}>
                <Tag style={{ fontSize: 11 }}>+{record.tags.length - 4}</Tag>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    ),
  },
  {
    title: '中文介绍',
    dataIndex: 'title_zh',
    key: 'title_zh',
    width: 350,
    render: (text) => text ? (
      <Paragraph
        ellipsis={{ rows: 3, tooltip: text }}
        style={{ margin: 0, fontSize: 13 }}
      >
        {text}
      </Paragraph>
    ) : <Text type="secondary" style={{ fontSize: 12 }}>暂无</Text>,
  },
  {
    title: <Space><EyeOutlined />播放量</Space>,
    dataIndex: 'views',
    key: 'views',
    width: 110,
    align: 'right',
    sorter: (a, b) => (a.views || 0) - (b.views || 0),
    render: (val) => <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>{formatNumber(val)}</Text>,
  },
  {
    title: <Space><LikeOutlined />点赞数</Space>,
    dataIndex: 'likes',
    key: 'likes',
    width: 110,
    align: 'right',
    sorter: (a, b) => (a.likes || 0) - (b.likes || 0),
    render: (val) => <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{formatNumber(val)}</Text>,
  },
  {
    title: <Space><CommentOutlined />评论数</Space>,
    dataIndex: 'comments',
    key: 'comments',
    width: 110,
    align: 'right',
    sorter: (a, b) => (a.comments || 0) - (b.comments || 0),
    render: (val) => <Text style={{ color: '#722ed1', fontWeight: 'bold' }}>{formatNumber(val)}</Text>,
  },
  {
    title: '发布时间',
    dataIndex: 'publish_time',
    key: 'publish_time',
    width: 130,
    render: (val) => dayjs(val).format('YYYY-MM-DD HH:mm'),
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render: (_, record) => (
      <a href={record.url} target="_blank" rel="noopener noreferrer">
        <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }}>
          查看视频
        </Button>
      </a>
    ),
  },
];

const TrendsDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTrendsToday();
      if (res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      message.error('加载热点数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 按 platform 分组
  const platformGroups = useMemo(() => {
    const groups = {};
    data.forEach(item => {
      const p = item.platform || 'unknown';
      if (!groups[p]) groups[p] = [];
      groups[p].push(item);
    });
    return groups;
  }, [data]);

  const platforms = Object.keys(platformGroups);

  const tabItems = [
    {
      key: 'all',
      label: <span>全部 <Tag>{data.length}</Tag></span>,
    },
    ...platforms.map(p => ({
      key: p,
      label: <span>{p.toUpperCase()} <Tag>{platformGroups[p].length}</Tag></span>,
    })),
  ];

  const tableData = activeTab === 'all' ? data : (platformGroups[activeTab] || []);

  const totalViews = tableData.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = tableData.reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalComments = tableData.reduce((sum, item) => sum + (item.comments || 0), 0);

  return (
    <div>
      {/* 顶部统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="热点视频数"
              value={tableData.length}
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总播放量"
              value={formatNumber(totalViews)}
              prefix={<EyeOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总点赞数"
              value={formatNumber(totalLikes)}
              prefix={<LikeOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总评论数"
              value={formatNumber(totalComments)}
              prefix={<CommentOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <FireOutlined style={{ color: '#ff4d4f' }} />
            <span>今日热点视频</span>
          </Space>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default TrendsDashboard;
