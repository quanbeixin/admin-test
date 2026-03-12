import { Table, Button, Space, Tag, message, Modal, Form, Input, Select, DatePicker, Drawer, Tabs, Upload, Dropdown, Card } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, RobotOutlined, ThunderboltOutlined, CopyOutlined, UploadOutlined, SettingOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { getAllFeedback, createFeedback, updateFeedback, deleteFeedback, updateFeedbackStatus, analyzeUnprocessedFeedback, analyzeSingleFeedback, batchImportFeedback } from '../api/feedback';

const { TextArea } = Input;

const FeedbackList = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mockInsertLoading, setMockInsertLoading] = useState(false);
  const [aiAnalyzeLoading, setAiAnalyzeLoading] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState([
    'date', 'user_email', 'product', 'user_question', 'user_question_cn',
    'ai_reply', 'ai_reply_en', 'ai_category', 'ai_sentiment', 'ai_processed',
    'is_new_request', 'status', 'action'
  ]);
  const [filters, setFilters] = useState({
    dateRange: null,
    product: null,
    status: null,
    isNewRequest: null
  });
  const [form] = Form.useForm();
  const [mockForm] = Form.useForm();

  useEffect(() => {
    fetchFeedback();
  }, []);

  // 获取所有产品列表和分组数据
  const { productTabs, filteredFeedbackList } = useMemo(() => {
    const products = [...new Set(feedbackList.map(item => item.product).filter(Boolean))];
    const tabs = [
      { key: 'all', label: '全部', count: feedbackList.length }
    ];

    products.forEach(product => {
      const count = feedbackList.filter(item => item.product === product).length;
      tabs.push({ key: product, label: product, count });
    });

    // 先按 tab 过滤
    let filtered = activeTab === 'all'
      ? feedbackList
      : feedbackList.filter(item => item.product === activeTab);

    // 再应用筛选条件
    if (filters.dateRange && filters.dateRange.length === 2) {
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isAfter(filters.dateRange[0]) && itemDate.isBefore(filters.dateRange[1]);
      });
    }

    if (filters.product) {
      filtered = filtered.filter(item => item.product === filters.product);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.isNewRequest !== null) {
      filtered = filtered.filter(item => item.is_new_request === filters.isNewRequest);
    }

    return { productTabs: tabs, filteredFeedbackList: filtered };
  }, [feedbackList, activeTab, filters]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await getAllFeedback();
      const data = response.data || response;
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('获取反馈列表失败');
      console.error('获取反馈列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMockInsert = async () => {
    try {
      const values = await mockForm.validateFields();
      const now = dayjs();

      const mockData = {
        date: now.format('YYYY-MM-DD HH:mm:ss'),
        user_email: values.user_email,
        product: values.product,
        channel: values.channel,
        user_question: values.user_question,
        issue_type: '待分类',
        user_request: '希望尽快优化该问题并提供处理进度。',
        is_new_request: false,
        status: 'pending'
      };

      setMockInsertLoading(true);
      await createFeedback(mockData);
      message.success('模拟数据插入成功');
      setIsMockModalOpen(false);
      mockForm.resetFields();
      fetchFeedback();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      message.error('模拟数据插入失败');
      console.error('模拟数据插入失败:', error);
    } finally {
      setMockInsertLoading(false);
    }
  };

  const handleAiAnalyze = async () => {
    Modal.confirm({
      title: 'AI 分析确认',
      content: '将调用AI模型分析所有未分类的反馈，是否继续？',
      okText: '开始分析',
      cancelText: '取消',
      onOk: async () => {
        setAiAnalyzeLoading(true);
        try {
          const result = await analyzeUnprocessedFeedback(3);
          message.success(result.message || '分析完成');
          fetchFeedback();
        } catch (error) {
          message.error('AI 分析失败');
          console.error('AI 分析失败:', error);
        } finally {
          setAiAnalyzeLoading(false);
        }
      }
    });
  };

  const handleSingleAnalyze = async (record) => {
    setAnalyzingIds(prev => new Set(prev).add(record.id));
    try {
      await analyzeSingleFeedback(record.id);
      message.success('分析完成');
      fetchFeedback();
    } catch (error) {
      message.error('分析失败');
      console.error('单条分析失败:', error);
    } finally {
      setAnalyzingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(record.id);
        return newSet;
      });
    }
  };

  const handleView = (record) => {
    setViewingFeedback(record);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record) => {
    setEditingFeedback(record);
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除来自 ${record.user_email} 的反馈吗？`,
      onOk: async () => {
        try {
          await deleteFeedback(record.id);
          message.success('删除成功');
          fetchFeedback();
        } catch (error) {
          message.error('删除失败');
          console.error('删除失败:', error);
        }
      }
    });
  };

  const handleStatusChange = async (record, newStatus) => {
    try {
      await updateFeedbackStatus(record.id, newStatus);
      message.success('状态更新成功');
      fetchFeedback();
    } catch (error) {
      message.error('状态更新失败');
      console.error('状态更新失败:', error);
    }
  };

  const handleCopy = (text, label) => {
    if (!text) {
      message.warning('内容为空，无法复制');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${label}已复制到剪贴板`);
    }).catch(() => {
      message.error('复制失败');
    });
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 验证数据格式
        if (jsonData.length === 0) {
          message.error('文件内容为空');
          return;
        }

        // 检查必填字段（支持中英文字段名）
        const firstRow = jsonData[0];
        const hasChineseFields = firstRow.hasOwnProperty('用户邮箱');
        const hasEnglishFields = firstRow.hasOwnProperty('user_email');

        if (!hasChineseFields && !hasEnglishFields) {
          message.error('文件格式不正确，请使用模板文件');
          return;
        }

        // 转换数据格式
        const formattedData = jsonData.map(row => ({
          date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          user_email: row['用户邮箱'] || row.user_email,
          product: row['产品'] || row.product,
          channel: row['反馈渠道'] || row.channel,
          user_question: row['用户问题'] || row.user_question,
          issue_type: '待分类',
          user_request: '',
          is_new_request: false,
          status: 'pending'
        }));

        // 验证必填字段
        const invalidRows = formattedData.filter(row =>
          !row.user_email || !row.product || !row.channel || !row.user_question
        );

        if (invalidRows.length > 0) {
          message.error(`有 ${invalidRows.length} 行数据缺少必填字段`);
          return;
        }

        handleBatchImport(formattedData);
      } catch (error) {
        message.error('文件解析失败，请检查文件格式');
        console.error('文件解析错误:', error);
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // 阻止自动上传
  };

  const handleBatchImport = async (data) => {
    setImportLoading(true);
    try {
      const result = await batchImportFeedback(data);
      message.success(`成功导入 ${data.length} 条数据`);
      setIsImportModalOpen(false);
      setFileList([]);
      fetchFeedback();
    } catch (error) {
      message.error('批量导入失败');
      console.error('批量导入失败:', error);
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const feedbackData = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD HH:mm:ss') : null
      };

      await updateFeedback(editingFeedback.id, feedbackData);
      message.success('更新成功');
      setIsModalOpen(false);
      form.resetFields();
      setEditingFeedback(null);
      fetchFeedback();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('更新失败');
        console.error('更新失败:', error);
      }
    }
  };

  const allColumns = [
    {
      title: '提交日期',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '用户邮箱',
      dataIndex: 'user_email',
      key: 'user_email',
      width: 200
    },
    {
      title: '产品',
      dataIndex: 'product',
      key: 'product',
      width: 120
    },
    {
      title: '问题描述',
      dataIndex: 'user_question',
      key: 'user_question',
      width: 250,
      ellipsis: true
    },
    {
      title: '问题描述（中文）',
      dataIndex: 'user_question_cn',
      key: 'user_question_cn',
      width: 250,
      ellipsis: true
    },
     {
      title: 'AI 回复',
      dataIndex: 'ai_reply',
      key: 'ai_reply',
      width: 180,
      ellipsis: true
    },
    {
      title: 'AI 回复转为英文',
      dataIndex: 'ai_reply_en',
      key: 'ai_reply_en',
      width: 180,
      ellipsis: true
    },
    {
      title: 'AI分类',
      dataIndex: 'ai_category',
      key: 'ai_category',
      width: 120,
      render: (category) => {
        const colorMap = {
          'Bug': 'red',
          '功能需求': 'blue',
          '投诉': 'orange',
          '咨询': 'green'
        };
        return category ? <Tag color={colorMap[category] || 'default'}>{category}</Tag> : '-';
      }
    },
    {
      title: '情绪',
      dataIndex: 'ai_sentiment',
      key: 'ai_sentiment',
      width: 100,
      render: (sentiment) => {
        const colorMap = {
          'Positive': 'green',
          'Neutral': 'default',
          'Negative': 'red'
        };
        return sentiment ? <Tag color={colorMap[sentiment]}>{sentiment}</Tag> : '-';
      }
    },
    {
      title: 'AI处理',
      dataIndex: 'ai_processed',
      key: 'ai_processed',
      width: 100,
      render: (processed) => (
        <Tag color={processed ? 'green' : 'default'}>
          {processed ? '已处理' : '未处理'}
        </Tag>
      )
    },
    {
      title: '是否新问题',
      dataIndex: 'is_new_request',
      key: 'is_new_request',
      width: 120,
      render: (isNew) => (
        <Tag color={isNew ? 'red' : 'blue'}>
          {isNew ? '新问题' : '已知问题'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => {
        const statusMap = {
          'pending': { text: '待处理', color: 'orange' },
          'processed': { text: '已处理', color: 'green' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return (
          <Tag
            color={statusInfo.color}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const newStatus = status === 'pending' ? 'processed' : 'pending';
              handleStatusChange(record, newStatus);
            }}
          >
            {statusInfo.text}
          </Tag>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<ThunderboltOutlined />}
            loading={analyzingIds.has(record.id)}
            onClick={() => handleSingleAnalyze(record)}
            disabled={analyzingIds.has(record.id)}
          >
            AI分析
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 根据可见列过滤
  const columns = allColumns.filter(col => visibleColumns.includes(col.key));

  // 列配置选项
  const columnOptions = [
    { label: '提交日期', value: 'date' },
    { label: '用户邮箱', value: 'user_email' },
    { label: '产品', value: 'product' },
    { label: '问题描述', value: 'user_question' },
    { label: '问题描述（中文）', value: 'user_question_cn' },
    { label: 'AI 回复', value: 'ai_reply' },
    { label: 'AI 回复转为英文', value: 'ai_reply_en' },
    { label: 'AI分类', value: 'ai_category' },
    { label: '情绪', value: 'ai_sentiment' },
    { label: 'AI处理', value: 'ai_processed' },
    { label: '是否新问题', value: 'is_new_request' },
    { label: '状态', value: 'status' },
    { label: '操作', value: 'action' }
  ];

  const handleColumnChange = (selectedColumns) => {
    // 确保操作列始终显示
    if (!selectedColumns.includes('action')) {
      selectedColumns.push('action');
    }
    setVisibleColumns(selectedColumns);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: null,
      product: null,
      status: null,
      isNewRequest: null
    });
  };

  // 获取产品选项
  const productOptions = useMemo(() => {
    return [...new Set(feedbackList.map(item => item.product).filter(Boolean))];
  }, [feedbackList]);

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <DatePicker.RangePicker
            placeholder={['开始日期', '结束日期']}
            value={filters.dateRange}
            onChange={(val) => handleFilterChange('dateRange', val)}
            style={{ width: 240 }}
          />
          <Select
            placeholder="产品"
            allowClear
            value={filters.product}
            onChange={(val) => handleFilterChange('product', val)}
            style={{ width: 150 }}
            options={productOptions.map(p => ({ label: p, value: p }))}
          />
          <Select
            placeholder="状态"
            allowClear
            value={filters.status}
            onChange={(val) => handleFilterChange('status', val)}
            style={{ width: 120 }}
            options={[
              { label: '待处理', value: 'pending' },
              { label: '已处理', value: 'processed' }
            ]}
          />
          <Select
            placeholder="是否新问题"
            allowClear
            value={filters.isNewRequest}
            onChange={(val) => handleFilterChange('isNewRequest', val)}
            style={{ width: 130 }}
            options={[
              { label: '新问题', value: true },
              { label: '已知问题', value: false }
            ]}
          />
          <Button onClick={handleResetFilters}>重置</Button>
          <span style={{ color: '#999', fontSize: 13 }}>共 {filteredFeedbackList.length} 条</span>
        </div>
      </Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Dropdown
          menu={{
            items: [
              {
                key: 'column-config',
                label: (
                  <div onClick={(e) => e.stopPropagation()}>
                    <div style={{ padding: '8px 0', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
                      选择显示列
                    </div>
                    <Select
                      mode="multiple"
                      style={{ width: 300 }}
                      placeholder="选择要显示的列"
                      value={visibleColumns}
                      onChange={handleColumnChange}
                      options={columnOptions}
                      maxTagCount="responsive"
                    />
                  </div>
                )
              }
            ]
          }}
          trigger={['click']}
        >
          <Button icon={<SettingOutlined />}>
            列设置
          </Button>
        </Dropdown>
        <Button
          type="default"
          icon={<RobotOutlined />}
          loading={aiAnalyzeLoading}
          onClick={handleAiAnalyze}
        >
          AI 批量分析
        </Button>
        <Button
          type="default"
          icon={<UploadOutlined />}
          onClick={() => setIsImportModalOpen(true)}
        >
          批量导入
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          loading={mockInsertLoading}
          onClick={() => setIsMockModalOpen(true)}
        >
          手动插入数据
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={productTabs.map(tab => ({
          key: tab.key,
          label: `${tab.label} (${tab.count})`,
          children: (
            <Table
              columns={columns}
              dataSource={filteredFeedbackList}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1500 }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          )
        }))}
      />

      <Modal
        title="手动插入数据"
        open={isMockModalOpen}
        onOk={handleMockInsert}
        onCancel={() => {
          setIsMockModalOpen(false);
          mockForm.resetFields();
        }}
        okText="确认插入"
        cancelText="取消"
        confirmLoading={mockInsertLoading}
      >
        <Form form={mockForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="用户邮箱"
            name="user_email"
            rules={[
              { required: true, message: '请输入用户邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入用户邮箱" />
          </Form.Item>
          <Form.Item
            label="产品"
            name="product"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item
            label="反馈渠道"
            name="channel"
            rules={[{ required: true, message: '请选择反馈渠道' }]}
          >
            <Select placeholder="请选择反馈渠道">
              <Select.Option value="邮件">邮件</Select.Option>
              <Select.Option value="表单">表单</Select.Option>
              <Select.Option value="表单">商店商店评论</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="问题详情"
            name="user_question"
            rules={[{ required: true, message: '请输入问题详情' }]}
          >
            <TextArea rows={4} placeholder="请输入问题详情" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑反馈"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingFeedback(null);
        }}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="提交日期" name="date">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="用户邮箱" name="user_email">
            <Input />
          </Form.Item>

          <Form.Item label="产品" name="product">
            <Input />
          </Form.Item>

          <Form.Item label="反馈渠道" name="channel">
            <Select>
              <Select.Option value="邮件">邮件</Select.Option>
              <Select.Option value="表单">表单</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="问题详情" name="user_question">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="问题类型" name="issue_type">
            <Input />
          </Form.Item>

          <Form.Item label="人工回复（中文）" name="support_reply">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="人工回复（英文）" name="support_reply_en">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Select>
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="processed">已处理</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal
        title="批量导入反馈数据"
        open={isImportModalOpen}
        onCancel={() => {
          setIsImportModalOpen(false);
          setFileList([]);
        }}
        footer={null}
      >
        <div style={{ marginTop: 20 }}>
          <Upload
            accept=".xlsx,.xls,.csv"
            fileList={fileList}
            beforeUpload={handleFileUpload}
            onRemove={() => setFileList([])}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <Button icon={<UploadOutlined />} loading={importLoading}>
              选择 Excel/CSV 文件
            </Button>
          </Upload>
          <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
            <p>文件格式要求：</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>支持 .xlsx, .xls, .csv 格式</li>
              <li>必填字段：用户邮箱、产品、反馈渠道、用户问题</li>
              <li>其他字段（日期、问题类型、状态等）会自动填充默认值</li>
            </ul>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // 生成模板文件
                const template = [
                  {
                    用户邮箱: 'example@email.com',
                    产品: '产品名称',
                    反馈渠道: '邮件',
                    用户问题: '问题描述'
                  }
                ];
                const ws = XLSX.utils.json_to_sheet(template);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, '反馈数据');
                XLSX.writeFile(wb, '反馈导入模板.xlsx');
              }}
            >
              下载导入模板
            </a>
          </div>
        </div>
      </Modal>

      {/* 查看详情抽屉 */}
      <Drawer
        title="反馈详情"
        placement="right"
        size="large"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {viewingFeedback && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>基本信息</h3>
              <p><strong>提交日期：</strong>{viewingFeedback.date ? dayjs(viewingFeedback.date).format('YYYY-MM-DD HH:mm:ss') : '-'}</p>
              <p><strong>用��邮箱：</strong>{viewingFeedback.user_email || '-'}</p>
              <p><strong>产品：</strong>{viewingFeedback.product || '-'}</p>
              <p><strong>反馈渠道：</strong>{viewingFeedback.channel || '-'}</p>
              <p><strong>状态：</strong>
                <Tag color={viewingFeedback.status === 'processed' ? 'green' : 'orange'}>
                  {viewingFeedback.status === 'processed' ? '已处理' : '待处理'}
                </Tag>
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>问题描述</h3>
              <p><strong>原文：</strong></p>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 12 }}>
                {viewingFeedback.user_question || '-'}
              </div>
              <p><strong>中文翻译：</strong></p>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {viewingFeedback.user_question_cn || '-'}
              </div>
              <p style={{ marginTop: 12 }}><strong>用户需求：</strong>{viewingFeedback.user_request || '-'}</p>
              <p><strong>是否新需求：</strong>{viewingFeedback.is_new_request ? '是' : '否'}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>AI 分析</h3>
              <p><strong>分类：</strong>
                <Tag color={viewingFeedback.ai_category === 'Bug' ? 'red' : 'blue'}>
                  {viewingFeedback.ai_category || '-'}
                </Tag>
              </p>
              <p><strong>情绪：</strong>
                <Tag color={
                  viewingFeedback.ai_sentiment === 'Positive' ? 'green' :
                  viewingFeedback.ai_sentiment === 'Negative' ? 'red' : 'default'
                }>
                  {viewingFeedback.ai_sentiment || '-'}
                </Tag>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong>AI 自动回复（中文）：</strong>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(viewingFeedback.ai_reply, 'AI 自动回复（中文）')}
                >
                  复制
                </Button>
              </div>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 12 }}>
                {viewingFeedback.ai_reply || '-'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong>AI 自动回复（英文）：</strong>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(viewingFeedback.ai_reply_en, 'AI 自动回复（英文）')}
                >
                  复制
                </Button>
              </div>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {viewingFeedback.ai_reply_en || '-'}
              </div>
            </div>

            <div>
              <h3>人工回复</h3>
              <p><strong>中文回复：</strong></p>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 12 }}>
                {viewingFeedback.support_reply || '-'}
              </div>
              <p><strong>英文回复：</strong></p>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {viewingFeedback.support_reply_en || '-'}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FeedbackList;
