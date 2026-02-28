# Dashboard 后端集成说明

## 功能概述

已完成前端与后端 Dashboard API 的完整集成，实现了以下功能：

### 1. API 接口集成

创建了 `src/api/dashboard.js`，包含以下接口：
- `getFields()` - 获取可用字段列表
- `getDashboards()` - 获取仪表盘列表
- `getDashboard(id)` - 获取单个仪表盘
- `createDashboard(data)` - 创建仪表盘
- `updateDashboard(id, data)` - 更新仪表盘
- `deleteDashboard(id)` - 删除仪表盘

### 2. 页面功能

#### 仪表盘列表页 (`/dashboard-list`)
- 展示所有仪表盘
- 创建新仪表盘
- 删除仪表盘
- 跳转到仪表盘详情

#### 仪表盘详情页 (`/dashboard/:id`)
- 从后端加载仪表盘配置
- 动态渲染图表布局
- 拖拽调整布局
- 保存布局到后端
- 日期范围筛选
- 配置仪表盘

### 3. 图表组件

所有图表组件已支持动态配置：

#### ChartBar (柱状图)
```javascript
config: {
  type: 'bar',
  title: '图表标题',
  xField: 'date',      // X轴字段
  yField: 'sales',     // Y轴字段
  yLabel: '销售额',
  color: '#5470c6'     // 颜色
}
```

#### ChartLine (折线图)
```javascript
config: {
  type: 'line',
  title: '图表标题',
  xField: 'date',
  yField: 'profit',
  yLabel: '利润',
  color: '#91cc75',
  areaColor: 'rgba(145, 204, 117, 0.3)'
}
```

#### ChartPie (饼图)
```javascript
config: {
  type: 'pie',
  title: '图表标题',
  categoryField: 'category',  // 分类字段
  valueField: 'sales'         // 数值字段
}
```

#### DataTable (表格)
```javascript
config: {
  type: 'table',
  fields: ['date', 'sales', 'profit'],
  fieldLabels: {
    date: '日期',
    sales: '销售额'
  },
  filters: {
    category: [
      { text: '电子产品', value: '电子产品' }
    ]
  },
  pageSize: 10
}
```

## 数据结构

### 创建仪表盘请求
```javascript
{
  name: "仪表盘名称",
  description: "仪表盘描述",
  layout: [
    {
      i: 'bar',           // 唯一标识
      x: 0,               // X坐标
      y: 0,               // Y坐标
      w: 6,               // 宽度
      h: 8,               // 高度
      minW: 4,            // 最小宽度
      minH: 6,            // 最小高度
      title: '图表标题'
    }
  ],
  config: {
    charts: {
      bar: { /* 图表配置 */ }
    },
    data: [ /* 数据数组 */ ]
  }
}
```

### 字段列表响应
```javascript
{
  data: [
    {
      name: 'date',
      label: '日期',
      type: 'date'
    },
    {
      name: 'sales',
      label: '销售额',
      type: 'number'
    }
  ]
}
```

## 使用流程

### 1. 创建仪表盘
1. 访问 `/dashboard-list`
2. 点击"创建仪表盘"按钮
3. 填写名称和描述
4. 系统创建空白仪表盘

### 2. 配置仪表盘
1. 在列表中点击"查看"进入仪表盘详情
2. 点击"配置"按钮
3. 选择数据源字段
4. 配置图表参数

### 3. 调整布局
1. 拖拽图表标题可移动位置
2. 拖拽图表右下角可调整大小
3. 点击"保存布局"按钮保存到后端

### 4. 数据筛选
1. 使用顶部日期范围选择器
2. 所有图表和表格自动更新

## 路由配置

- `/dashboard-list` - 仪表盘列表
- `/dashboard/:id` - 仪表盘详情

## 注意事项

1. **数据格式**：后端返回的数据应包含在 `config.data` 字段中
2. **布局保存**：拖拽后需手动点击"保存布局"按钮
3. **字段映射**：图表配置中的字段名需与数据字段名一致
4. **响应式**：布局会自动适应窗口大小变化

## 示例数据

参考 `src/utils/dashboardExamples.js` 查看完整的数据结构示例。

## 测试建议

1. 使用 Postman 测试后端 API
2. 创建测试仪表盘并验证 CRUD 操作
3. 测试拖拽布局并验证保存功能
4. 测试日期筛选功能
5. 验证不同图表类型的渲染
