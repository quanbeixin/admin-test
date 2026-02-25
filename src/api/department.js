import request from './request';

// 获取部门列表
export const getDepartmentList = (params) => {
  return request({
    url: '/departments',
    method: 'get',
    params,
  });
};
