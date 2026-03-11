import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Select, InputNumber, Space, message, Typography } from 'antd';
import { ReloadOutlined, FireOutlined } from '@ant-design/icons';
import { getHotTopicList } from '../api/trends';
import dayjs from 'dayjs';

const { Text } = Typography;

const platformColorMap = {
  tiktok_ai: 'volcano',
  midjourney: 'purple',
  youtube: 'red',
  instagram: 'magenta',
};

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 70,
  },
  {
    title: '最热关键词',
    dataIndex: 'keyword',
    key: 'keyword',
    width: 300,
    render: (val) => <Text strong>{val}</Text>,
  },
  {
    title: '热度分数',
    dataIndex: 'score',
    key: 'score',
    width: 120,
    sorter: (a, b) => (a.score || 0) - (b.score || 0),
    render: (val) =>
      val != null ? (
        <Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{val.toFixed(1)}</Text>
      ) : (
        <Text type="secondary">-</Text>
      ),
  },
  {
    title: '热点话题',
    dataIndex: 'topic',
    key: 'topic',
    render: (val) =>
      val ? <Text>{val}</Text> : <Text type="secondary">暂无</Text>,
  },
  {
    title: '平台',
    dataIndex: 'platform',
    key: 'platform',
    width: 140,
    render: (val) =>
      val ? (
        <Tag color={platformColorMap[val] || 'blue'}>{val}</Tag>
      ) : (
        <Text type="secondary">-</Text>
      ),
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 170,
    render: (val) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
  },
];

const HotTopicList = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState(undefined);
  const [days, setDays] = useState(undefined);
  const [limit, setLimit] = useState(20);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { limit };
      if (platform) params.platform = platform;
      if (days) params.days = days;
      const res = await getHotTopicList(params);
      if (res.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (error) {
      message.error('加载热点话题失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <Card
        title={
          <Space>
            <FireOutlined style={{ color: '#ff4d4f' }} />
            <span>热点话题列表</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="平台筛选"
              allowClear
              style={{ width: 150 }}
              value={platform}
              onChange={setPlatform}
              options={[
                { label: 'TikTok AI', value: 'tiktok_ai' },
                { label: 'Midjourney', value: 'midjourney' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Instagram', value: 'instagram' },
              ]}
            />
            <InputNumber
              placeholder="最近N天"
              min={1}
              max={365}
              style={{ width: 110 }}
              value={days}
              onChange={setDays}
            />
            <InputNumber
              placeholder="条数"
              min={1}
              max={200}
              style={{ width: 90 }}
              value={limit}
              onChange={(val) => setLimit(val || 20)}
            />
            <Button type="primary" icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
              查询
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          footer={() => <Text type="secondary">共 {total} 条</Text>}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default HotTopicList;
