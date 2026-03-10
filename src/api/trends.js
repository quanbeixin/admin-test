import request from './request';

export const getTrendsToday = () => {
  return request.get('/trends/today');
};

export const getHotTopicList = (params) => {
  return request.get('/trends/hot-topics', { params });
};
