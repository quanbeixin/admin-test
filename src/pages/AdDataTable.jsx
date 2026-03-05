import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, DatePicker, Select, message, Input } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AdDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 筛选条件
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    adName: '',
    status: '',
  });

  // 加载数据
  const loadData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const baseURL = "https://graph.facebook.com/v25.0";
      const path = "/act_1370841834819438/insights";

      const response = await axios.get(baseURL + path, {
        params: {
          access_token: "EAATfGj5H2DYBQZCmfkgiHV7TtaLvHEEZAb2nmfjWbZBb6IgVGLUNaEIahOAo7AZA81bUSJs5hj4K2jPWNQzbeGol6shBNbhVDjYiCLObYudunE6gvkmtPx5EusFBeOBTdKMObymicP4AVXPBe8bHBDC9ZCXjboLKPRLSkZBRUItVCClV3v14Agh7CciMtomGNX4gZDZD",
          level: "ad",
          fields: "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,account_id,account_name,account_currency,impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,conversions,conversion_values,purchase_roas,cost_per_action_type,actions",
          time_range: JSON.stringify({
            since: filters.startDate,
            until: filters.endDate
          }),
          page:page,
          limit:pageSize
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      const { data: responseData } = response.data;

      setData(responseData || []);
      setPagination({
        current: page,
        pageSize,
        total: responseData?.length || 0,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error(error.response?.data?.message || '加载数据失败，请稍后重试');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadData(pagination.current, pagination.pageSize);
  }, []);

  // 处理表格分页变化
  const handleTableChange = (newPagination) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  // 处理搜索
  const handleSearch = () => {
    loadData(1, pagination.pageSize);
  };

  // 处理重置
  const handleReset = () => {
    setFilters({
      startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      adName: '',
      status: '',
    });
    // 重置后自动搜索
    setTimeout(() => {
      loadData(1, pagination.pageSize);
    }, 0);
  };

  // 表格列定义
  const columns = [
    {
      title: '广告名称',
      dataIndex: 'campaign_name',
      key: 'campaign_name',
      width: 600,
      ellipsis: true,
    },
    {
      title: '视频名称',
      dataIndex: 'ad_name',
      key: 'ad_name',
      width: 120,
      ellipsis: true,
    },
    {
      title: '展示量',
      dataIndex: 'impressions',
      key: 'impressions',
      width: 120,
      align: 'right',
      render: (value) => value?.toLocaleString() || 0,
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      width: 120,
      align: 'right',
      render: (value) => value?.toLocaleString() || 0,
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr',
      width: 100,
      align: 'right',
      render: (value, record) => {
        const ctr = record.impressions > 0
          ? ((record.clicks / record.impressions) * 100).toFixed(2)
          : 0;
        return `${ctr}%`;
      },
    },
    {
      title: '花费',
      dataIndex: 'spend',
      key: 'spend',
      width: 120,
      align: 'right',
      render: (value) => `¥${(parseFloat(value) || 0).toFixed(2)}`,
    },
    {
      title: '转化量',
      dataIndex: 'conversions',
      key: 'conversions',
      width: 100,
      align: 'right',
      render: (conversions) => {
        if (!conversions || !Array.isArray(conversions)) return 0;
        const subscribeTotal = conversions.find(c => c.action_type === 'subscribe_total');
        return subscribeTotal?.value?.toLocaleString() || 0;
      },
    }
  ];

  return (
    <Card title="投放数据表">
      {/* 筛选区域 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker
          value={[
            filters.startDate ? dayjs(filters.startDate) : null,
            filters.endDate ? dayjs(filters.endDate) : null,
          ]}
          onChange={(dates) => {
            setFilters({
              ...filters,
              startDate: dates?.[0]?.format('YYYY-MM-DD') || '',
              endDate: dates?.[1]?.format('YYYY-MM-DD') || '',
            });
          }}
          format="YYYY-MM-DD"
        />
        <Input
          placeholder="广告名称"
          value={filters.adName}
          onChange={(e) => setFilters({ ...filters, adName: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder="状态"
          value={filters.status || undefined}
          onChange={(value) => setFilters({ ...filters, status: value })}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value="active">投放中</Select.Option>
          <Select.Option value="paused">已暂停</Select.Option>
          <Select.Option value="completed">已完成</Select.Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
        <Button onClick={handleReset}>重置</Button>
        <Button icon={<ReloadOutlined />} onClick={() => loadData(pagination.current, pagination.pageSize)}>
          刷新
        </Button>
      </Space>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="ad_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default AdDataTable;
