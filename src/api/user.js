import request from './request';

// 用户登录
export const login = (data) => {
  return request({
    url: '/users/login',
    method: 'post',
    data,
  });
};

// 用户登出
export const logout = () => {
  return request({
    url: '/users/logout',
    method: 'post',
  });
};

// 用户注册
export const register = (data) => {
  return request({
    url: '/users/register',
    method: 'post',
    data,
  });
};

// 获取用户列表
export const getUserList = (params) => {
  return request({
    url: '/users',
    method: 'get',
    params,
  });
};

// 获取单个用户信息
export const getUserById = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'get',
  });
};

// 创建用户
export const createUser = (data) => {
  return request({
    url: '/users/createUser',
    method: 'post',
    data,
  });
};

// 更新用户
export const updateUser = (id, data) => {
  return request({
    url: `/users/update/${id}`,
    method: 'post',
    data,
  });
};

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/users/delete/${id}`,
    method: 'post',
  });
};
