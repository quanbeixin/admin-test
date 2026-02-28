import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DatePicker, Card, Button, message, Spin } from 'antd';
import { SaveOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import ChartBar from './ChartBar';
import ChartLine from './ChartLine';
import ChartPie from './ChartPie';
import DataTable from './DataTable';
import ChartManager from './ChartManager';
import { getDashboard, updateDashboard, getFields } from '../../api/dashboard';
import mockData from '../../data/mockData.json';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Dashboard.css';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(null);
  const [width, setWidth] = useState(1200);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [layout, setLayout] = useState([]);
  const [fields, setFields] = useState([]);
  const [chartManagerVisible, setChartManagerVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (id) {
      loadDashboard();
      loadFields();
    }
  }, [id]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await getDashboard(id);
      const data = response.data;

      // 如果后端没有返回数据，使用 mockData
      if (!data.config?.data || data.config.data.length === 0) {
        data.config = {
          ...data.config,
          data: mockData
        };
      }

      setDashboard(data);
      setLayout(data.layout || []);
    } catch (error) {
      message.error('加载仪表盘失败');
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

  const handleSaveLayout = async () => {
    try {
      await updateDashboard(id, {
        ...dashboard,
        layout: layout
      });
      message.success('布局保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const handleSaveCharts = async (charts) => {
    try {
      // 构建新的布局
      const newLayout = charts.map((chart, index) => ({
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
      charts.forEach(chart => {
        chartsConfig[chart.id] = chart;
      });

      await updateDashboard(id, {
        ...dashboard,
        layout: newLayout,
        config: {
          ...dashboard.config,
          charts: chartsConfig
        }
      });

      message.success('图表配置已保存');
      setChartManagerVisible(false);
      loadDashboard();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const getCurrentCharts = () => {
    if (!dashboard?.config?.charts) return [];
    return Object.keys(dashboard.config.charts).map(key => ({
      id: key,
      ...dashboard.config.charts[key]
    }));
  };

  const filteredData = useMemo(() => {
    if (!dashboard?.config?.data) {
      return [];
    }

    const data = dashboard.config.data;

    if (!dateRange || dateRange.length !== 2) {
      return data;
    }

    const [start, end] = dateRange;
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= start.toDate() && itemDate <= end.toDate();
    });
  }, [dashboard, dateRange]);

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const renderChart = (item) => {
    const chartConfig = dashboard?.config?.charts?.[item.i];
    if (!chartConfig) return null;

    switch (chartConfig.type) {
      case 'bar':
        return <ChartBar data={filteredData} config={chartConfig} />;
      case 'line':
        return <ChartLine data={filteredData} config={chartConfig} />;
      case 'pie':
        return <ChartPie data={filteredData} config={chartConfig} />;
      case 'table':
        return <DataTable data={filteredData} config={chartConfig} />;
      default:
        return <div>未知图表类型</div>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <p>仪表盘不存在</p>
        <Button onClick={() => navigate('/dashboard-list')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="dashboard-container" ref={containerRef}>
      <div className="dashboard-header">
        <div>
          <h2>{dashboard.name}</h2>
          {dashboard.description && <p style={{ margin: 0, color: '#666' }}>{dashboard.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <RangePicker
            onChange={handleDateChange}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
          />
          <Button
            icon={<AppstoreAddOutlined />}
            onClick={() => setChartManagerVisible(true)}
          >
            管理图表
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveLayout}
          >
            保存布局
          </Button>
        </div>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={width}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
      >
        {layout.map((item) => (
          <div key={item.i}>
            <Card
              title={<span className="drag-handle">{item.title || item.i}</span>}
              variant="borderless"
              style={{ height: '100%' }}
              styles={{
                body: {
                  height: 'calc(100% - 57px)',
                  padding: item.i.includes('table') ? 0 : 24
                }
              }}
            >
              {renderChart(item)}
            </Card>
          </div>
        ))}
      </GridLayout>

      <ChartManager
        visible={chartManagerVisible}
        onClose={() => setChartManagerVisible(false)}
        charts={getCurrentCharts()}
        fields={fields}
        onSave={handleSaveCharts}
      />
    </div>
  );
};

export default Dashboard;
