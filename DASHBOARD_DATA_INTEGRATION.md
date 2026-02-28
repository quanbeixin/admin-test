# Dashboard 真实数据集成说明

## 数据源切换完成

已成功将 Dashboard 模块从 mockData 切换到真实的广告数据库。

## 后端 API

### 新增接口

#### 1. 获取广告数据
```
GET /api/ad-reports
```
**参数：**
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `limit`: 返回数量限制（默认 1000）

#### 2. 获取广告数据统计
```
GET /api/ad-reports/stats
```
**参数：**
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `groupBy`: 分组字段（默认 report_date）

**返回数据格式：**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-02-28",
      "spent_amount": 12500.50,
      "impressions": 150000,
      "clicks": 3500,
      "installs": 250,
      "subscriptions": 50,
      "count": 10
    }
  ]
}
```

#### 3. 获取广告活动列表
```
GET /api/ad-reports/campaigns
```

#### 4. 获取可用字段
```
GET /api/dashboards/fields
```

**返回字段列表：**
- `report_date`: 统计日期
- `ad_id`: 广告ID
- `campaign_name`: 广告系列名称
- `spent_amount`: 已花金额
- `impressions`: 展示次数
- `cpm`: 千次展示费用
- `clicks`: 点击量
- `ctr`: 点击率
- `cpc`: 单次点击费用
- `installs`: 应用安装
- `cpi`: 单次安装费用
- `subscriptions`: 订阅次数
- `cps`: 单次订阅费用
- `video_play_3s`: 3秒视频播放

## 前端集成

### 数据加载流程

1. **创建仪表盘时**
   - 自动调用 `/api/ad-reports/stats` 获取最近 30 天的聚合数据
   - 如果 API 失败，回退到 mockData

2. **加载仪表盘时**
   - 从后端加载仪表盘配置
   - 调用 `/api/ad-reports/stats` 获取最新数据
   - 如果 API 失败，使用 mockData 作为备用

3. **日期筛选**
   - 前端根据用户选择的日期范围过滤数据
   - 未来可以优化为直接调用后端 API 传递日期参数

## 数据库表结构

表名：`ad_reports`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 自增主键 |
| ad_id | varchar(100) | 广告ID |
| campaign_name | varchar(255) | 广告系列名称 |
| report_date | date | 统计日期 |
| spent_amount | decimal(18,2) | 已花金额 |
| impressions | bigint | 展示次数 |
| cpm | decimal(10,2) | 千次展示费用 |
| clicks | bigint | 点击量 |
| ctr | decimal(5,4) | 点击率 |
| cpc | decimal(10,2) | 单次点击费用 |
| installs | bigint | 应用安装 |
| cpi | decimal(10,2) | 单次安装费用 |
| subscriptions | bigint | 订阅次数 |
| cps | decimal(10,2) | 单次订阅费用 |
| video_play_3s | bigint | 3秒视频播放 |
| created_at | timestamp | 创建时间 |

## 默认图表配置

创建仪表盘时的默认字段映射：

- **柱状图**: X轴=date, Y轴=spent_amount
- **折线图**: X轴=date, Y轴=clicks
- **饼图**: 分类=campaign_name, 数值=spent_amount
- **表格**: 显示 date, spent_amount, clicks, installs, subscriptions

## 部署说明

### 后端部署

1. 确保数据库中有 `ad_reports` 表
2. 重启后端服务或重新部署到 Vercel
3. 验证 API 端点可访问

### 前端部署

1. 前端代码已自动集成，无需额外配置
2. 重新部署前端应用
3. 测试仪表盘创建和数据加载

## 测试步骤

1. 访问 `/dashboard-list`
2. 创建新仪表盘
3. 添加图表（柱状图、折线图、饼图、表格）
4. 配置字段映射
5. 保存并查看仪表盘
6. 验证数据是否正确显示

## 注意事项

- 如果数据库中没有数据，系统会自动使用 mockData 作为备用
- 日期筛选目前在前端进行，大数据量时可能影响性能
- 建议定期清理旧数据或添加数据归档功能
