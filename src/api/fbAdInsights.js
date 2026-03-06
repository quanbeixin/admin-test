import request from './request';

// 获取 Facebook 广告投放数据（支持筛选和分页）
export const getFbAdInsights = (params) => {
  return request.get('/fb-ad-insights', { params });
};

// 获取 Facebook 广告数据统计汇总
export const getFbAdInsightsStats = (params) => {
  return request.get('/fb-ad-insights/stats', { params });
};

// 获取筛选维度的可选值列表
export const getFbAdInsightsFilters = (field) => {
  return request.get('/fb-ad-insights/filters', { params: { field } });
};

// 获取广告系列列表
export const getFbAdInsightsCampaigns = () => {
  return request.get('/fb-ad-insights/campaigns');
};
