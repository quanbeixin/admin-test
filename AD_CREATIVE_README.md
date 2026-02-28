# 广告创意管理模块

## 功能概述

动态可配置：平台字段

## 选型字段管理

数据库名称：ad_option_fields

## 选型字段管理

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

### 功能说明

需要包含 增删改查

### 使用方法

## API 接口

## 注意事项
