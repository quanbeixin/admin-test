import request from './request';

// 获取选型字段列表
export const getOptionFields = (params) => {
  return request.get('/option-fields', { params });
};

// 获取树形结构数据
export const getOptionFieldsTree = (params) => {
  return request.get('/option-fields/tree', { params });
};

// 获取单个选型字段
export const getOptionField = (id) => {
  return request.get(`/option-fields/${id}`);
};

// 创建选型字段
export const createOptionField = (data) => {
  return request.post('/option-fields', data);
};

// 更新选型字段
export const updateOptionField = (id, data) => {
  return request.put(`/option-fields/${id}`, data);
};

// 删除选型字段
export const deleteOptionField = (id) => {
  return request.delete(`/option-fields/${id}`);
};

// 批量删除选型字段
export const batchDeleteOptionFields = (ids) => {
  return request.post('/option-fields/batch-delete', { ids });
};

// 获取字段名列表
export const getFieldNames = () => {
  return request.get('/option-fields/field-names');
};

