import request from './request';

// 获取所有账户
export const getAllAccounts = () => {
  return request.get('/fb-ad-accounts');
};

// 获取单个账户
export const getAccountById = (id) => {
  return request.get(`/fb-ad-accounts/${id}`);
};

// 创建账户
export const createAccount = (data) => {
  return request.post('/fb-ad-accounts', data);
};

// 更新账户
export const updateAccount = (id, data) => {
  return request.put(`/fb-ad-accounts/${id}`, data);
};

// 删除账户
export const deleteAccount = (id) => {
  return request.delete(`/fb-ad-accounts/${id}`);
};
