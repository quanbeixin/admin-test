// 示例：创建仪表盘的数据结构

// 1. 创建仪表盘请求示例
const createDashboardExample = {
  name: "销售数据仪表盘",
  description: "展示每日销售、利润和产品分类数据",
  layout: [
    { i: 'bar', x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6, title: '每日销售额' },
    { i: 'line', x: 6, y: 0, w: 6, h: 8, minW: 4, minH: 6, title: '每日利润' },
    { i: 'pie', x: 0, y: 8, w: 6, h: 8, minW: 4, minH: 6, title: '产品分类占比' },
    { i: 'table', x: 6, y: 8, w: 6, h: 8, minW: 4, minH: 6, title: '销售明细' }
  ],
  config: {
    charts: {
      bar: {
        type: 'bar',
        title: '每日销售额',
        xField: 'date',
        yField: 'sales',
        yLabel: '销售额 (元)',
        color: '#5470c6'
      },
      line: {
        type: 'line',
        title: '每日利润',
        xField: 'date',
        yField: 'profit',
        yLabel: '利润 (元)',
        color: '#91cc75',
        areaColor: 'rgba(145, 204, 117, 0.3)'
      },
      pie: {
        type: 'pie',
        title: '产品分类占比',
        categoryField: 'category',
        valueField: 'sales'
      },
      table: {
        type: 'table',
        fields: ['date', 'sales', 'profit', 'category'],
        fieldLabels: {
          date: '日期',
          sales: '销售额 (元)',
          profit: '利润 (元)',
          category: '产品分类'
        },
        filters: {
          category: [
            { text: '电子产品', value: '电子产品' },
            { text: '服装', value: '服装' },
            { text: '食品', value: '食品' }
          ]
        },
        pageSize: 10
      }
    },
    data: [
      {
        date: "2026-01-30",
        sales: 12500,
        profit: 3750,
        category: "电子产品"
      },
      {
        date: "2026-01-31",
        sales: 15200,
        profit: 4560,
        category: "服装"
      }
      // ... 更多数据
    ]
  }
};

// 2. 字段列表示例
const fieldsExample = [
  { name: 'date', label: '日期', type: 'date' },
  { name: 'sales', label: '销售额', type: 'number' },
  { name: 'profit', label: '利润', type: 'number' },
  { name: 'category', label: '产品分类', type: 'string' }
];

// 3. 更新仪表盘布局示例
const updateLayoutExample = {
  layout: [
    { i: 'bar', x: 0, y: 0, w: 12, h: 8, minW: 4, minH: 6, title: '每日销售额' },
    { i: 'line', x: 0, y: 8, w: 6, h: 8, minW: 4, minH: 6, title: '每日利润' },
    { i: 'pie', x: 6, y: 8, w: 6, h: 8, minW: 4, minH: 6, title: '产品分类占比' },
    { i: 'table', x: 0, y: 16, w: 12, h: 8, minW: 4, minH: 6, title: '销售明细' }
  ]
};

export { createDashboardExample, fieldsExample, updateLayoutExample };
