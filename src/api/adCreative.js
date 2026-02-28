import request from './request';

// 获取广告创意列表
export const getAdCreatives = (params) => {
  return request.get('/ad-creatives', { params });
};

// 获取单个广告创意
export const getAdCreative = (id) => {
  return request.get(`/ad-creatives/${id}`);
};

// 创建广告创意
export const createAdCreative = (data) => {
  return request.post('/ad-creatives', data);
};

// 更新广告创意
export const updateAdCreative = (id, data) => {
  return request.put(`/ad-creatives/${id}`, data);
};

// 删除广告创意
export const deleteAdCreative = (id) => {
  return request.delete(`/ad-creatives/${id}`);
};

// 批量删除广告创意
export const batchDeleteAdCreatives = (ids) => {
  return request.post('/ad-creatives/batch-delete', { ids });
};
