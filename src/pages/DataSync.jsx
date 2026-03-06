import React, { useState, useMemo } from 'react';
import { Card, Button, Space, Statistic, Row, Col, Alert, Table, Tag, message, DatePicker, Tabs } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { syncMetaInsights, previewMetaInsights } from '../api/metaSync';
import dayjs from 'dayjs';

// 动态生成表格列（根据数据自动生成）
const generateColumns = (data) => {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  return keys.map(key => ({
    title: key,
    dataIndex: key,
    key: key,
    width: 150,
    ellipsis: true,
    render: (value) => {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }
  }));
};

const syncAccountColumns = [
  { title: '账户ID', dataIndex: 'accountId', key: 'accountId', width: 200 },
  { title: '账户名称', dataIndex: 'accountName', key: 'accountName', width: 200 },
  {
    title: '同步数据量', dataIndex: 'synced', key: 'synced', width: 120,
    render: (count) => (
      <span style={{ fontWeight: 'bold', color: count > 0 ? '#52c41a' : '#999' }}>{count} 条</span>
    ),
  },
  {
    title: '状态', key: 'status', width: 100,
    render: (_, record) => {
      if (record.error) return <Tag icon={<CloseCircleOutlined />} color="error">失败</Tag>;
      if (record.synced > 0) return <Tag icon={<CheckCircleOutlined />} color="success">成功</Tag>;
      return <Tag icon={<ClockCircleOutlined />} color="default">无数据</Tag>;
    },
  },
  {
    title: '错误信息', dataIndex: 'error', key: 'error', ellipsis: true,
    render: (error) => error ? <span style={{ color: '#ff4d4f' }}>{error}</span> : '-',
  },
];

const DataSync = () => {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);

  // 默认日期：昨天
  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, 'day'));

  const handleSync = async () => {
    if (!selectedDate) {
      message.error('请选择日期');
      return;
    }

    try {
      setLoading(true);
      setSyncResult(null);
      message.loading({ content: '正在同步数据，请稍候...', key: 'sync', duration: 0 });

      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await syncMetaInsights({
        since: dateStr,
        until: dateStr
      });
      message.destroy('sync');

      setSyncResult(response);
      if (response.success) {
        if (response.errors && response.errors.length > 0) {
          message.warning(`同步完成，但有 ${response.errors.length} 个账户失败`);
        } else {
          message.success(`同步成功！共同步 ${response.totalSynced} 条数据`);
        }
      } else {
        message.error(response.message || '同步失败');
      }
    } catch (error) {
      message.destroy('sync');
      message.error('同步失败: ' + (error.response?.data?.message || error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedDate) {
      message.error('请选择日期');
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewResult(null);
      message.loading({ content: '正在获取预览数据...', key: 'preview', duration: 0 });

      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await previewMetaInsights({
        since: dateStr,
        until: dateStr,
        limit: 10000
      });
      message.destroy('preview');

      if (response.success) {
        setPreviewResult(response);
        message.success(`预览成功！共 ${response.totalCount} 条数据`);
      } else {
        message.error(response.message || '预览失败');
      }
    } catch (error) {
      message.destroy('preview');
      message.error('预览失败: ' + (error.response?.data?.message || error.message || '未知错误'));
    } finally {
      setPreviewLoading(false);
    }
  };

  // 将所有账户的 sampleData 合并为一个列表，带账户名
  const previewTableData = previewResult?.accounts?.flatMap(account =>
    (account.sampleData || []).map((row, i) => ({
      ...row,
      _key: `${account.accountId}_${i}`,
      _accountName: account.accountName,
    }))
  ) || [];

  // 预览表格 tabs（每个账户一个 tab）
  const previewTabs = useMemo(() => {
    return previewResult?.accounts?.map(account => {
      const columns = generateColumns(account.sampleData || []);

      return {
        key: account.accountId,
        label: `${account.accountName} (${account.dataCount} 条)`,
        children: (
          <Table
            columns={columns}
            dataSource={(account.sampleData || []).map((row, i) => ({ ...row, _key: `${i}` }))}
            rowKey="_key"
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条数据`,
              pageSizeOptions: ['20', '50', '100', '200', '500']
            }}
            locale={{ emptyText: account.error ? `获取失败: ${account.error}` : '暂无数据' }}
          />
        ),
      };
    }) || [];
  }, [previewResult]);

  return (
    <div>
      <Card title="Meta Insights 数据同步" style={{ marginBottom: 24 }}>
        <Alert
          title="数据同步说明"
          description="此功能从 Meta 广告平台同步所有活跃账户的 Insights 数据。建议每天同步单天数据用于趋势分析。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Space orientation="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
          {/* 快捷日期选择 */}
          <Space size="middle">
            <span>快捷选择：</span>
            <Button
              size="small"
              onClick={() => setSelectedDate(dayjs())}
              disabled={loading || previewLoading}
            >
              今天
            </Button>
            <Button
              size="small"
              onClick={() => setSelectedDate(dayjs().subtract(1, 'day'))}
              disabled={loading || previewLoading}
            >
              昨天
            </Button>
            <Button
              size="small"
              onClick={() => setSelectedDate(dayjs().subtract(2, 'day'))}
              disabled={loading || previewLoading}
            >
              前天
            </Button>
          </Space>

          {/* 单日期选择 */}
          <Space size="large">
            <div>
              <span style={{ marginRight: 8 }}>选择日期：</span>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                disabled={loading || previewLoading}
                format="YYYY-MM-DD"
                allowClear={false}
              />
            </div>

            <Button
              size="large"
              icon={<EyeOutlined />}
              onClick={handlePreview}
              loading={previewLoading}
              disabled={loading}
            >
              {previewLoading ? '预览中...' : '预览数据'}
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<SyncOutlined spin={loading} />}
              onClick={handleSync}
              loading={loading}
              disabled={previewLoading}
            >
              {loading ? '同步中...' : '开始同步'}
            </Button>
          </Space>
        </Space>

        {/* 预览结果 */}
        {previewResult && (
          <Card
            title={`数据预览（共 ${previewResult.totalCount} 条）`}
            size="small"
            style={{ marginBottom: 24 }}
            type="inner"
          >
            {previewTabs.length > 0 ? (
              <Tabs items={previewTabs} />
            ) : (
              <span style={{ color: '#999' }}>暂无数据</span>
            )}
          </Card>
        )}

        {/* 同步结果 */}
        {syncResult && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="总同步数据量"
                    value={syncResult.totalSynced}
                    suffix="条"
                    styles={{ content: { color: '#3f8600' } }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="成功账户数"
                    value={syncResult.accounts?.filter(a => !a.error).length || 0}
                    suffix={`/ ${syncResult.accounts?.length || 0}`}
                    styles={{ content: { color: '#1890ff' } }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="失败账户数"
                    value={syncResult.errors?.length || 0}
                    styles={{ content: { color: syncResult.errors?.length > 0 ? '#cf1322' : '#999' } }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {syncResult.accounts && syncResult.accounts.length > 0 && (
              <Table
                columns={syncAccountColumns}
                dataSource={syncResult.accounts}
                rowKey="accountId"
                pagination={false}
                size="middle"
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DataSync;
