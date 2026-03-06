import request from './request';

// 同步 Meta Insights 数据
export const syncMetaInsights = ({ since, until }) => {
  return request.post('/meta/sync-insights', { since, until }, { timeout: 300000 });
};

// 预览 Meta Insights 数据（不写入数据库）
export const previewMetaInsights = ({ since, until, limit = 10000 }) => {
  return request.post('/meta/preview-insights', { since, until, limit }, { timeout: 300000 });
};
