# 平台字段管理模块使用说明

## 功能概述

平台字段管理模块用于动态配置系统中的选型字段选项，如广告创意的状态（status）、阶段（stage）、类型（creative_type）等。通过此模块，管理员可以灵活地添加、修改、删除各种字段的可选值，无需修改代码。

## 部署步骤

### 1. 创建数据库表

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 位置: admin-backend/sql/create_ad_option_fields.sql
```

该 SQL 会创建 `ad_option_fields` 表并插入示例数据。

### 2. 启动后端服务

```bash
cd admin-backend
npm run dev
```

后端服务会在 http://localhost:3000 启动。

### 3. 启动前端服务

```bash
cd admin-web
npm run dev
```

前端服务会在 http://localhost:5173 启动。

### 4. 访问模块

登录系统后，在左侧菜单找到：
**平台配置 > 选型字段管理**

## 功能说明

### 1. 查看选项列表

- 显示所有已配置的字段选项
- 支持按字段名筛选
- 支持按启用/禁用状态筛选
- 支持分页浏览

### 2. 创建新选项

点击"创建选项"按钮，填写以下信息：

- **字段名**（必填）：如 `status`、`stage`、`creative_type`
  - 只能包含小写字母和下划线
  - 示例：`status`, `creative_type`, `platform`

- **选项值**（必填）：如 `draft`、`image`、`active`
  - 只能包含小写字母和下划线
  - 用于程序内部使用
  - 示例：`draft`, `active`, `image`

- **显示标签**（必填）：如 `草稿`、`图片`、`激活`
  - 用户界面显示的中文名称
  - 示例：`草稿`, `激活`, `图片`

- **排序**（可选）：数值越小越靠前，默认为 0

- **是否启用**（可选）：默认启用，可临时禁用某些选项

### 3. 编辑选项

点击列表中的"编辑"按钮，可修改选项的任何信息。

### 4. 删除选项

- 单个删除：点击"删除"按钮
- 批量删除：勾选多个选项后，点击"批量删除"

## 数据结构

### ad_option_fields 表

| 字段         | 类型      | 说明                                            |
| ------------ | --------- | ----------------------------------------------- |
| id           | uuid      | 主键                                            |
| field_name   | varchar   | 字段名，例如 `status`、`stage`、`creative_type` |
| option_value | varchar   | 值，例如 `draft`、`image`                       |
| option_label | varchar   | 中文显示，例如 `草稿`、`图片`                   |
| sort_order   | int       | 排序，前端显示用                                |
| is_active    | boolean   | 是否可用，用于临时禁用某些选项                  |
| created_at   | timestamp | 创建时间                                        |
| updated_at   | timestamp | 更新时间                                        |

### 唯一约束

同一字段名下的选项值不能重复，例如：
- ✅ 允许：`status` + `active`
- ✅ 允许：`stage` + `active`
- ❌ 不允许：`status` + `active`（重复）

## API 接口

### 基础路径
```
http://localhost:3000/api/option-fields
```

### 接口列表

#### 1. 获取选项列表
```
GET /api/option-fields
Query参数:
  - page: 页码（默认1）
  - limit: 每页数量（默认20）
  - field_name: 字段名筛选
  - is_active: 状态筛选（true/false）
```

#### 2. 获取字段名列表
```
GET /api/option-fields/field-names
返回所有不重复的字段名
```

#### 3. 获取单个选项
```
GET /api/option-fields/:id
```

#### 4. 创建选项
```
POST /api/option-fields
Body: {
  "field_name": "status",
  "option_value": "draft",
  "option_label": "草稿",
  "sort_order": 1,
  "is_active": true
}
```

#### 5. 更新选项
```
PUT /api/option-fields/:id
Body: {
  "option_label": "新标签",
  "sort_order": 2,
  "is_active": false
}
```

#### 6. 删除选项
```
DELETE /api/option-fields/:id
```

#### 7. 批量删除
```
POST /api/option-fields/batch-delete
Body: {
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

## 使用场景

### 1. 为广告创意添加新状态

假设需要添加一个"暂停"状态：

1. 进入"选型字段管理"
2. 点击"创建选项"
3. 填写：
   - 字段名：`status`
   - 选项值：`paused`
   - 显示标签：`已暂停`
   - 排序：`4`
4. 保存后，广告创意模块的状态下拉框会自动包含"已暂停"选项

### 2. 添加新的广告平台

假设需要支持 LinkedIn 平台：

1. 进入"选型字段管理"
2. 点击"创建选项"
3. 填写：
   - 字段名：`platform`
   - 选项值：`linkedin`
   - 显示标签：`LinkedIn`
   - 排序：`6`
4. 保存后，平台选择下拉框会包含 LinkedIn

### 3. 临时禁用某个选项

如果某个广告类型暂时不可用：

1. 找到对应的选项（如 `creative_type` = `carousel`）
2. 点击"编辑"
3. 将"是否启用"切换为"禁用"
4. 保存后，该选项在前端不会显示

## 注意事项

1. **字段名和选项值命名规范**
   - 只能使用小写字母和下划线
   - 建议使用英文单词
   - 保持简洁明了

2. **删除操作**
   - 删除选项前请确认没有数据在使用该选项
   - 删除后无法恢复
   - 建议使用"禁用"而不是"删除"

3. **排序规则**
   - 数值越小越靠前
   - 相同排序值按创建时间排序
   - 建议使用 10、20、30 这样的间隔，便于后续插入

4. **权限要求**
   - 需要登录才能访问
   - 所有操作都需要有效的 JWT token

## 技术实现

### 后端
- **框架**: Express.js
- **数据库**: Supabase (PostgreSQL)
- **认证**: JWT Token
- **文件位置**:
  - 控制器: `admin-backend/controllers/optionFieldController.js`
  - 路由: `admin-backend/routes/optionFields.js`
  - SQL: `admin-backend/sql/create_ad_option_fields.sql`

### 前端
- **框架**: React 19.2.0
- **UI 库**: Ant Design 6.x
- **路由**: React Router v6
- **文件位置**:
  - 页面组件: `admin-web/src/pages/OptionFieldList.jsx`
  - API 调用: `admin-web/src/api/optionField.js`
  - 路由配置: `admin-web/src/router/index.jsx`
  - 菜单配置: `admin-web/src/layouts/MainLayout.jsx`

## 扩展建议

1. **添加分组功能**
   - 为字段添加分组，便于管理大量选项

2. **添加描述字段**
   - 为每个选项添加详细描述

3. **添加图标支持**
   - 为选项配置图标，提升用户体验

4. **添加多语言支持**
   - 支持多种语言的显示标签

5. **添加使用统计**
   - 显示每个选项被使用的次数

## 故障排查

### 问题1: 创建选项时提示"重复"
**原因**: 同一字段名下已存在相同的选项值
**解决**: 检查是否已有相同的 field_name + option_value 组合

### 问题2: 前端无法加载数据
**原因**: 后端服务未启动或数据库表未创建
**解决**:
1. 检查后端服务是否运行
2. 检查数据库表是否已创建
3. 检查浏览器控制台的错误信息

### 问题3: 菜单中找不到"选型字段管理"
**原因**: 前端代码未更新或浏览器缓存
**解决**:
1. 刷新浏览器（Ctrl+F5）
2. 检查路由配置是否正确
3. 检查菜单配置是否正确

## 更新日志

### v1.0.0 (2026-02-28)
- ✅ 初始版本发布
- ✅ 完整的 CRUD 功能
- ✅ 字段名筛选
- ✅ 启用/禁用状态管理
- ✅ 批量删除功能
- ✅ 排序功能
- ✅ 示例数据初始化
