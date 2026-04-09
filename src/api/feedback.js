import request from './request';

// 获取所有反馈
export const getAllFeedback = (params) => {
  return request({
    url: '/feedback',
    method: 'get',
    params
  });
};

// 获取单个反馈
export const getFeedbackById = (id) => {
  return request({
    url: `/feedback/${id}`,
    method: 'get'
  });
};

// 创建反馈
export const createFeedback = (data) => {
  return request({
    url: '/webhook/feedback',
    method: 'post',
    data
  });
};

// 更新反馈
export const updateFeedback = (id, data) => {
  return request({
    url: `/feedback/${id}`,
    method: 'put',
    data
  });
};

// 删除反馈
export const deleteFeedback = (id) => {
  return request({
    url: `/feedback/${id}`,
    method: 'delete'
  });
};

// 更新反馈状态
export const updateFeedbackStatus = (id, status) => {
  return request({
    url: `/feedback/${id}/status`,
    method: 'patch',
    data: { status }
  });
};

// 批量更新状态
export const batchUpdateStatus = (ids, status) => {
  return request({
    url: '/feedback/batch/status',
    method: 'post',
    data: { ids, status }
  });
};

// AI 分析未处理的反馈
export const analyzeUnprocessedFeedback = (limit = 10) => {
  return request({
    url: '/feedback/analyze/unprocessed',
    method: 'post',
    params: { limit },
    timeout: 120000
  });
};

// AI 分析单条反馈
export const analyzeSingleFeedback = (id) => {
  return request({
    url: `/feedback/${id}/analyze`,
    method: 'post'
  });
};

// 批量导入反馈
export const batchImportFeedback = (data) => {
  return request({
    url: '/feedback/batch/import',
    method: 'post',
    data
  });
};
