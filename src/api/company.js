import request from './request';

// 获取所有公司
export const getAllCompanies = () => {
  return request.get('/companies');
};

// 获取单个公司
export const getCompanyById = (id) => {
  return request.get(`/companies/${id}`);
};

// 创建公司
export const createCompany = (data) => {
  return request.post('/companies', data);
};

// 更新公司
export const updateCompany = (id, data) => {
  return request.put(`/companies/${id}`, data);
};

// 删除公司
export const deleteCompany = (id) => {
  return request.delete(`/companies/${id}`);
};
