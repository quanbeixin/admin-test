import React, { useState } from 'react';
import { Table } from 'antd';

const DataTable = ({ data, config = {} }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = config.pageSize || 10;

  // 动态生成列配置
  const generateColumns = () => {
    if (!data || data.length === 0) return [];

    const fields = config.fields || Object.keys(data[0]);

    return fields.map(field => {
      const column = {
        title: config.fieldLabels?.[field] || field,
        dataIndex: field,
        key: field
      };

      // 如果是数字类型，添加排序和格式化
      if (typeof data[0][field] === 'number') {
        column.sorter = (a, b) => a[field] - b[field];
        column.render = (value) => value?.toLocaleString();
      }

      // 如果是日期字段，添加排序
      if (field === 'date' || field.includes('Date') || field.includes('Time')) {
        column.sorter = (a, b) => new Date(a[field]) - new Date(b[field]);
      }

      // 如果配置了过滤器
      if (config.filters?.[field]) {
        column.filters = config.filters[field];
        column.onFilter = (value, record) => record[field] === value;
      }

      return column;
    });
  };

  const columns = generateColumns();

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '10px' }}>
      <Table
        columns={columns}
        dataSource={data.map((item, index) => ({ ...item, key: index }))}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="small"
      />
    </div>
  );
};

export default DataTable;
