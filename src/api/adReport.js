import request from './request';

// 获取广告数据
export const getAdReports = (params) => {
  return request.get('/ad-reports', { params });
};

// 获取广告数据统计
export const getAdReportsStats = (params) => {
  return request.get('/ad-reports/stats', { params });
};

// 获取广告活动列表
export const getCampaigns = () => {
  return request.get('/ad-reports/campaigns');
};
