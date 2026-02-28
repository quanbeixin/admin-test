# Dashboard 模块使用说明

## 功能特性

1. **四个图表组件**
   - 柱状图：显示每日销售额
   - 折线图：显示每日利润趋势
   - 饼图：显示产品分类占比
   - 数据表格：显示每日销售明细，支持排序、筛选和分页

2. **拖拽布局**
   - 使用 react-grid-layout 实现
   - 每个图表可以拖拽调整位置
   - 每个图表可以调整大小
   - 响应式布局，自动适配不同屏幕尺寸

3. **日期筛选**
   - 顶部日期范围选择器
   - 实时筛选所有图表和表格数据

4. **表格功能**
   - 支持按日期、销售额、利润排序
   - 支持按产品分类筛选
   - 分页显示，每页 10 条记录

## 文件结构

```
src/
├── components/
│   └── dashboard/
│       ├── Dashboard.jsx          # 主仪表盘组件
│       ├── Dashboard.css          # 样式文件
│       ├── ChartBar.jsx           # 柱状图组件
│       ├── ChartLine.jsx          # 折线图组件
│       ├── ChartPie.jsx           # 饼图组件
│       └── DataTable.jsx          # 数据表格组件
├── data/
│   └── mockData.json              # 模拟数据
└── pages/
    └── DashboardPage.jsx          # Dashboard 页面
```

## 访问方式

启动项目后，在侧边栏菜单中点击"数据仪表盘"即可访问。

路由地址：`/dashboard`

## 数据格式

mockData.json 数据格式：
```json
[
  {
    "date": "2026-01-30",
    "sales": 12500,
    "profit": 3750,
    "category": "电子产品"
  }
]
```

## 依赖包

已安装的依赖：
- echarts: ECharts 图表库
- echarts-for-react: React 封装的 ECharts 组件
- react-grid-layout: 拖拽布局库

## 自定义说明

如需修改数据源，可以：
1. 修改 `src/data/mockData.json` 文件
2. 或在 `Dashboard.jsx` 中替换为 API 调用获取真实数据
