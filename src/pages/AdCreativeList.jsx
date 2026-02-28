import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Image,
  Tooltip,
  Checkbox,
  Dropdown,
  Flex,
  Upload
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  SettingOutlined,
  FileImageOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getAdCreatives,
  createAdCreative,
  updateAdCreative,
  deleteAdCreative,
  batchDeleteAdCreatives
} from '../api/adCreative';
import { uploadFile } from '../api/upload';

const { Search } = Input;
const { TextArea } = Input;

const AdCreativeList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    topic: '',
    status: '',
    stage: '',
    creative_type: '',
    review_status: ''
  });
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 文件上传状态
  const [coverFileList, setCoverFileList] = useState([]);
  const [fileFileList, setFileFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 列显示配置
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('adCreativeVisibleColumns');
    return saved ? JSON.parse(saved) : {
      cover_url: true,
      topic: true,
      creative_type: true,
      stage: true,
      status: true,
      review_status: true,
      platform: true,
      dimensions: true,
      description: false,
      file_url: false,
      tags: false,
      priority: false,
      created_at: true,
      updated_at: false
    };
  });

  // 保存列配置到 localStorage
  const saveColumnConfig = (config) => {
    setVisibleColumns(config);
    localStorage.setItem('adCreativeVisibleColumns', JSON.stringify(config));
  };

  // 切换列显示
  const toggleColumn = (columnKey) => {
    const newConfig = {
      ...visibleColumns,
      [columnKey]: !visibleColumns[columnKey]
    };
    saveColumnConfig(newConfig);
  };

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await getAdCreatives(params);
      setData(response.data || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0
      });
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, topic: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setCoverFileList([]);
    setFileFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);

    // 设置已有的文件列表
    if (record.cover_url) {
      setCoverFileList([{
        uid: '-1',
        name: '封面图片',
        status: 'done',
        url: record.cover_url
      }]);
    } else {
      setCoverFileList([]);
    }

    if (record.file_url) {
      setFileFileList([{
        uid: '-1',
        name: '素材文件',
        status: 'done',
        url: record.file_url
      }]);
    } else {
      setFileFileList([]);
    }

    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdCreative(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的项');
      return;
    }

    try {
      await batchDeleteAdCreatives(selectedRowKeys);
      message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
      setSelectedRowKeys([]);
      loadData();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 自定义上传处理
  const handleUpload = async (file, type) => {
    setUploading(true);
    try {
      const response = await uploadFile(file);
      // 构建完整的文件访问 URL（直接指向后端服务器）
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const fileUrl = `${backendUrl}${response.data.url}`;

      // 更新表单字段
      if (type === 'cover') {
        form.setFieldsValue({ cover_url: fileUrl });
      } else if (type === 'file') {
        form.setFieldsValue({ file_url: fileUrl });
      }

      message.success('上传成功');
      return fileUrl;
    } catch (error) {
      message.error('上传失败');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // 清理数据：移除空值，转换数字类型
      const cleanedData = {};
      Object.keys(values).forEach(key => {
        const value = values[key];
        // 跳过空值
        if (value === undefined || value === null || value === '') {
          return;
        }
        // 转换数字字段
        if (['width', 'height', 'duration', 'priority'].includes(key)) {
          const num = parseInt(value, 10);
          if (!isNaN(num)) {
            cleanedData[key] = num;
          }
        } else {
          cleanedData[key] = value;
        }
      });

      if (editingRecord) {
        await updateAdCreative(editingRecord.id, cleanedData);
        message.success('更新成功');
      } else {
        await createAdCreative(cleanedData);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || '操作失败';
      message.error(`${editingRecord ? '更新' : '创建'}失败: ${errorMsg}`);
      console.error('提交错误:', error.response?.data || error);
    }
  };

  // 所有可用的列定义
  const allColumns = [
    {
      title: '封面',
      dataIndex: 'cover_url',
      key: 'cover_url',
      width: 80,
      render: (url) => url ? (
        <Image
          src={url}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%23999'%3E加载失败%3C/text%3E%3C/svg%3E"
          preview={true}
        />
      ) : (
        <div style={{
          width: 60,
          height: 60,
          background: '#fafafa',
          borderRadius: 4,
          border: '1px dashed #d9d9d9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#bfbfbf'
        }}>
          <FileImageOutlined style={{ fontSize: 24 }} />
        </div>
      )
    },
    {
      title: '主题',
      dataIndex: 'topic',
      key: 'topic',
      width: 200,
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'creative_type',
      key: 'creative_type',
      width: 100,
      render: (type) => type ? <Tag color="blue">{type}</Tag> : '-'
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 100,
      render: (stage) => {
        const colorMap = {
          draft: 'default',
          review: 'processing',
          approved: 'success',
          rejected: 'error',
          published: 'cyan'
        };
        return <Tag color={colorMap[stage] || 'default'}>{stage || '-'}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colorMap = {
          active: 'success',
          inactive: 'default',
          archived: 'warning'
        };
        return <Tag color={colorMap[status] || 'default'}>{status || '-'}</Tag>;
      }
    },
    {
      title: '审核状态',
      dataIndex: 'review_status',
      key: 'review_status',
      width: 100,
      render: (status) => {
        const colorMap = {
          pending: 'warning',
          approved: 'success',
          rejected: 'error'
        };
        return <Tag color={colorMap[status] || 'default'}>{status || '-'}</Tag>;
      }
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100
    },
    {
      title: '尺寸',
      key: 'dimensions',
      width: 100,
      render: (_, record) => {
        if (record.width && record.height) {
          return `${record.width}x${record.height}`;
        }
        return '-';
      }
    },
    {
      title: '文件URL',
      dataIndex: 'file_url',
      key: 'file_url',
      width: 200,
      ellipsis: true,
      render: (url) => url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">查看文件</a>
      ) : '-'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags) => tags && tags.length > 0 ? (
        <Space size={[0, 4]} wrap>
          {tags.map((tag, index) => (
            <Tag key={index} color="geekblue">{tag}</Tag>
          ))}
        </Space>
      ) : '-'
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0)
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-'
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 160,
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/ad-creatives/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 根据配置过滤显示的列
  const columns = allColumns.filter(col => {
    if (col.key === 'action') return true; // 操作列始终显示
    return visibleColumns[col.key] !== false;
  });

  // 列设置菜单
  const columnSettingsMenu = {
    items: [
      {
        key: 'cover_url',
        label: (
          <Checkbox
            checked={visibleColumns.cover_url}
            onChange={() => toggleColumn('cover_url')}
          >
            封面
          </Checkbox>
        )
      },
      {
        key: 'topic',
        label: (
          <Checkbox
            checked={visibleColumns.topic}
            onChange={() => toggleColumn('topic')}
          >
            主题
          </Checkbox>
        )
      },
      {
        key: 'description',
        label: (
          <Checkbox
            checked={visibleColumns.description}
            onChange={() => toggleColumn('description')}
          >
            描述
          </Checkbox>
        )
      },
      {
        key: 'creative_type',
        label: (
          <Checkbox
            checked={visibleColumns.creative_type}
            onChange={() => toggleColumn('creative_type')}
          >
            类型
          </Checkbox>
        )
      },
      {
        key: 'stage',
        label: (
          <Checkbox
            checked={visibleColumns.stage}
            onChange={() => toggleColumn('stage')}
          >
            阶段
          </Checkbox>
        )
      },
      {
        key: 'status',
        label: (
          <Checkbox
            checked={visibleColumns.status}
            onChange={() => toggleColumn('status')}
          >
            状态
          </Checkbox>
        )
      },
      {
        key: 'review_status',
        label: (
          <Checkbox
            checked={visibleColumns.review_status}
            onChange={() => toggleColumn('review_status')}
          >
            审核状态
          </Checkbox>
        )
      },
      {
        key: 'platform',
        label: (
          <Checkbox
            checked={visibleColumns.platform}
            onChange={() => toggleColumn('platform')}
          >
            平台
          </Checkbox>
        )
      },
      {
        key: 'dimensions',
        label: (
          <Checkbox
            checked={visibleColumns.dimensions}
            onChange={() => toggleColumn('dimensions')}
          >
            尺寸
          </Checkbox>
        )
      },
      {
        key: 'file_url',
        label: (
          <Checkbox
            checked={visibleColumns.file_url}
            onChange={() => toggleColumn('file_url')}
          >
            文件URL
          </Checkbox>
        )
      },
      {
        key: 'tags',
        label: (
          <Checkbox
            checked={visibleColumns.tags}
            onChange={() => toggleColumn('tags')}
          >
            标签
          </Checkbox>
        )
      },
      {
        key: 'priority',
        label: (
          <Checkbox
            checked={visibleColumns.priority}
            onChange={() => toggleColumn('priority')}
          >
            优先级
          </Checkbox>
        )
      },
      {
        key: 'created_at',
        label: (
          <Checkbox
            checked={visibleColumns.created_at}
            onChange={() => toggleColumn('created_at')}
          >
            创建时间
          </Checkbox>
        )
      },
      {
        key: 'updated_at',
        label: (
          <Checkbox
            checked={visibleColumns.updated_at}
            onChange={() => toggleColumn('updated_at')}
          >
            更新时间
          </Checkbox>
        )
      }
    ]
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys)
  };

  return (
    <div>
      <Card>
        <Flex vertical gap="middle" style={{ width: '100%' }}>
          {/* 搜索和筛选 */}
          <Space wrap>
            <Search
              placeholder="搜索主题"
              allowClear
              style={{ width: 250 }}
              onSearch={handleSearch}
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="archived">Archived</Select.Option>
            </Select>
            <Select
              placeholder="阶段"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('stage', value)}
            >
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="review">Review</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
              <Select.Option value="published">Published</Select.Option>
            </Select>
            <Select
              placeholder="审核状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('review_status', value)}
            >
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
          </Space>

          {/* 操作按钮 */}
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建创意
            </Button>
            <Dropdown menu={columnSettingsMenu} trigger={['click']}>
              <Button icon={<SettingOutlined />}>
                列设置
              </Button>
            </Dropdown>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`}
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除
                </Button>
              </Popconfirm>
            )}
          </Space>

          {/* 表格 */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1500 }}
          />
        </Flex>
      </Card>

      {/* 创建/编辑 Modal */}
      <Modal
        title={editingRecord ? '编辑广告创意' : '创建广告创意'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="topic"
            label="主题"
            rules={[
              { required: true, message: '请输入主题' },
              { max: 200, message: '主题不能超过200个字符' }
            ]}
            tooltip="必填项，用于标识广告创意的主题"
          >
            <Input placeholder="请输入主题" showCount maxLength={200} />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            tooltip="可选项，详细描述广告创意内容"
          >
            <TextArea rows={4} placeholder="请输入描述" showCount maxLength={500} />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="creative_type"
              label="创意类型"
              style={{ width: 200 }}
              tooltip="广告素材的类型"
              rules={[{ required: true, message: '请选择创意类型' }]}
            >
              <Select placeholder="选择类型">
                <Select.Option value="image">图片</Select.Option>
                <Select.Option value="video">视频</Select.Option>
                <Select.Option value="carousel">轮播</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="stage"
              label="阶段"
              style={{ width: 200 }}
              tooltip="默认为草稿"
              initialValue="draft"
            >
              <Select placeholder="选择阶段">
                <Select.Option value="draft">草稿</Select.Option>
                <Select.Option value="review">审核中</Select.Option>
                <Select.Option value="approved">已批准</Select.Option>
                <Select.Option value="published">已发布</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              style={{ width: 200 }}
              tooltip="默认为激活"
              initialValue="active"
            >
              <Select placeholder="选择状态">
                <Select.Option value="active">激活</Select.Option>
                <Select.Option value="inactive">未激活</Select.Option>
                <Select.Option value="archived">已归档</Select.Option>
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="platform"
              label="平台"
              style={{ width: 200 }}
              tooltip="投放平台，如 Facebook, TikTok"
            >
              <Input placeholder="如: Facebook, TikTok" />
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
              style={{ width: 200 }}
              tooltip="数值越大优先级越高，默认为 0"
              initialValue={0}
            >
              <Input type="number" placeholder="0-100" min={0} max={100} />
            </Form.Item>
          </Space>

          <Form.Item
            name="file_url"
            label="素材文件"
            tooltip="上传广告素材文件（图片/视频）"
          >
            <Upload
              listType="picture"
              fileList={fileFileList}
              beforeUpload={(file) => {
                handleUpload(file, 'file');
                return false;
              }}
              onRemove={() => {
                setFileFileList([]);
                form.setFieldsValue({ file_url: '' });
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                点击上传素材文件
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="cover_url"
            label="封面图片"
            tooltip="上传广告封面图片"
          >
            <Upload
              listType="picture-card"
              fileList={coverFileList}
              beforeUpload={(file) => {
                handleUpload(file, 'cover');
                return false;
              }}
              onRemove={() => {
                setCoverFileList([]);
                form.setFieldsValue({ cover_url: '' });
              }}
              maxCount={1}
            >
              {coverFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传封面</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="width"
              label="宽度"
              style={{ width: 150 }}
              tooltip="素材宽度（像素）"
              rules={[
                { type: 'number', transform: (value) => Number(value), message: '请输入数字' }
              ]}
            >
              <Input type="number" placeholder="像素" min={1} />
            </Form.Item>

            <Form.Item
              name="height"
              label="高度"
              style={{ width: 150 }}
              tooltip="素材高度（像素）"
              rules={[
                { type: 'number', transform: (value) => Number(value), message: '请输入数字' }
              ]}
            >
              <Input type="number" placeholder="像素" min={1} />
            </Form.Item>

            <Form.Item
              name="duration"
              label="时长"
              style={{ width: 150 }}
              tooltip="视频时长（秒）"
              rules={[
                { type: 'number', transform: (value) => Number(value), message: '请输入数字' }
              ]}
            >
              <Input type="number" placeholder="秒" min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default AdCreativeList;

