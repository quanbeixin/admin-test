import request from './request';

// 获取任务列表
export const getTaskList = (params) => {
  return request({
    url: '/tasks',
    method: 'get',
    params,
  });
};

// 获取我的任务
export const getMyTasks = (params) => {
  return request({
    url: '/tasks/my',
    method: 'get',
    params,
  });
};

// 获取单个任务信息
export const getTaskById = (id) => {
  return request({
    url: `/tasks/${id}`,
    method: 'get',
  });
};

// 创建任务
export const createTask = (data) => {
  return request({
    url: '/tasks/create',
    method: 'post',
    data,
  });
};

// 更新任务
export const updateTask = (id, data) => {
  return request({
    url: `/tasks/update/${id}`,
    method: 'post',
    data,
  });
};

// 删除任务
export const deleteTask = (id) => {
  return request({
    url: `/tasks/delete/${id}`,
    method: 'post',
  });
};
