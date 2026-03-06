import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, DatePicker, Select, message, Input, Tag, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { getFbAdInsights, getFbAdInsightsFilters } from '../api/fbAdInsights';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

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
    campaignName: '',
    adsetName: '',
    adName: '',
    brand: undefined,
    platform: undefined,
    region: undefined,
    appType: undefined,
    device: undefined,
  });

  // 筛选维度选项
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    platforms: [],
    regions: [],
    appTypes: [],
    devices: [],
  });

  // 统计数据
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalImpressions: 0,
    totalClicks: 0,
    avgCtr: 0,
  });

  // 加载筛选维度选项
  const loadFilterOptions = async () => {
    try {
      const [brands, platforms, regions, appTypes, devices] = await Promise.all([
        getFbAdInsightsFilters('brand'),
        getFbAdInsightsFilters('platform'),
        getFbAdInsightsFilters('region'),
        getFbAdInsightsFilters('app_type'),
        getFbAdInsightsFilters('device'),
      ]);

      setFilterOptions({
        brands: brands.data || [],
        platforms: platforms.data || [],
        regions: regions.data || [],
        appTypes: appTypes.data || [],
        devices: devices.data || [],
      });
    } catch (error) {
      console.error('加载筛选选项失败:', error);
    }
  };

  // 加载数据
  const loadData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        pageSize,
        sortBy: 'date',
        sortOrder: 'desc',
      };

      // 添加非空筛选条件
      if (filters.campaignName) params.campaignName = filters.campaignName;
      if (filters.adsetName) params.adsetName = filters.adsetName;
      if (filters.adName) params.adName = filters.adName;
      if (filters.brand) params.brand = filters.brand;
      if (filters.platform) params.platform = filters.platform;
      if (filters.region) params.region = filters.region;
      if (filters.appType) params.appType = filters.appType;
      if (filters.device) params.device = filters.device;

      const response = await getFbAdInsights(params);

      if (response.success) {
        setData(response.data || []);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.pageSize,
          total: response.pagination.total,
        });

        // 计算统计数据
        const totalSpend = response.data.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
        const totalImpressions = response.data.reduce((sum, item) => sum + parseInt(item.impressions || 0), 0);
        const totalClicks = response.data.reduce((sum, item) => sum + parseInt(item.clicks || 0), 0);
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;

        setStats({
          totalSpend,
          totalImpressions,
          totalClicks,
          avgCtr,
        });
      }
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
    loadFilterOptions();
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
      campaignName: '',
      adsetName: '',
      adName: '',
      brand: undefined,
      platform: undefined,
      region: undefined,
      appType: undefined,
      device: undefined,
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '广告名称',
      dataIndex: 'extra_description',
      key: 'extra_description',
      width: 500,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
      render: (text) => text ? <Tag color="blue">{text}</Tag> : '-',
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (text) => text ? <Tag color="green">{text}</Tag> : '-',
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 100,
    },
    {
      title: '应用类型',
      dataIndex: 'app_type',
      key: 'app_type',
      width: 100,
    },
    {
      title: '设备',
      dataIndex: 'device',
      key: 'device',
      width: 100,
    },
    {
      title: '展示次数',
      dataIndex: 'impressions',
      key: 'impressions',
      width: 120,
      align: 'right',
      render: (value) => value?.toLocaleString() || 0,
    },
    {
      title: '点击次数',
      dataIndex: 'clicks',
      key: 'clicks',
      width: 120,
      align: 'right',
      render: (value) => value?.toLocaleString() || 0,
    },
    {
      title: '花费',
      dataIndex: 'spend',
      key: 'spend',
      width: 120,
      align: 'right',
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
    {
      title: '覆盖人数',
      dataIndex: 'reach',
      key: 'reach',
      width: 120,
      align: 'right',
      render: (value) => value?.toLocaleString() || 0,
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      width: 100,
      align: 'right',
      render: (value) => `${parseFloat(value || 0).toFixed(2)}%`,
    },
    {
      title: 'CPC',
      dataIndex: 'cpc',
      key: 'cpc',
      width: 100,
      align: 'right',
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
    {
      title: 'CPM',
      dataIndex: 'cpm',
      key: 'cpm',
      width: 100,
      align: 'right',
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总花费"
              value={stats.totalSpend}
              precision={2}
              prefix="$"
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总展示次数"
              value={stats.totalImpressions}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总点击次数"
              value={stats.totalClicks}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均 CTR"
              value={stats.avgCtr}
              suffix="%"
              precision={2}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Facebook 广告投放数据">
        {/* 筛选条件 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  ...filters,
                  startDate: dates[0].format('YYYY-MM-DD'),
                  endDate: dates[1].format('YYYY-MM-DD'),
                });
              }
            }}
          />
          <Input
            placeholder="广告系列名称"
            value={filters.campaignName}
            onChange={(e) => setFilters({ ...filters, campaignName: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="广告组名称"
            value={filters.adsetName}
            onChange={(e) => setFilters({ ...filters, adsetName: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="广告名称"
            value={filters.adName}
            onChange={(e) => setFilters({ ...filters, adName: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Select
            placeholder="品牌"
            value={filters.brand}
            onChange={(value) => setFilters({ ...filters, brand: value })}
            style={{ width: 120 }}
            allowClear
          >
            {filterOptions.brands.map(brand => (
              <Option key={brand} value={brand}>{brand}</Option>
            ))}
          </Select>
          <Select
            placeholder="平台"
            value={filters.platform}
            onChange={(value) => setFilters({ ...filters, platform: value })}
            style={{ width: 120 }}
            allowClear
          >
            {filterOptions.platforms.map(platform => (
              <Option key={platform} value={platform}>{platform}</Option>
            ))}
          </Select>
          <Select
            placeholder="地区"
            value={filters.region}
            onChange={(value) => setFilters({ ...filters, region: value })}
            style={{ width: 120 }}
            allowClear
          >
            {filterOptions.regions.map(region => (
              <Option key={region} value={region}>{region}</Option>
            ))}
          </Select>
          <Select
            placeholder="应用类型"
            value={filters.appType}
            onChange={(value) => setFilters({ ...filters, appType: value })}
            style={{ width: 120 }}
            allowClear
          >
            {filterOptions.appTypes.map(appType => (
              <Option key={appType} value={appType}>{appType}</Option>
            ))}
          </Select>
          <Select
            placeholder="设备"
            value={filters.device}
            onChange={(value) => setFilters({ ...filters, device: value })}
            style={{ width: 120 }}
            allowClear
          >
            {filterOptions.devices.map(device => (
              <Option key={device} value={device}>{device}</Option>
            ))}
          </Select>
        </Space>

        <Space style={{ marginBottom: 16 }}>
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
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 2000 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default AdDataTable;
