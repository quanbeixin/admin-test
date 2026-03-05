import request from './request';

// ==================== 字段分组 ====================
// 获取分组列表
export const getFieldGroups = (params) => {
  return request.get('/field-groups', { params });
};

// 获取单个分组
export const getFieldGroup = (id) => {
  return request.get(`/field-groups/${id}`);
};

// 创建分组
export const createFieldGroup = (data) => {
  return request.post('/field-groups', data);
};

// 更新分组
export const updateFieldGroup = (id, data) => {
  return request.put(`/field-groups/${id}`, data);
};

// 删除分组
export const deleteFieldGroup = (id) => {
  return request.delete(`/field-groups/${id}`);
};

// ==================== 字段定义 ====================
// 获取字段列表
export const getFieldDefinitions = (params) => {
  return request.get('/field-definitions', { params });
};

// 获取单个字段
export const getFieldDefinition = (id) => {
  return request.get(`/field-definitions/${id}`);
};

// 创建字段
export const createFieldDefinition = (data) => {
  return request.post('/field-definitions', data);
};

// 更新字段
export const updateFieldDefinition = (id, data) => {
  return request.put(`/field-definitions/${id}`, data);
};

// 删除字段
export const deleteFieldDefinition = (id) => {
  return request.delete(`/field-definitions/${id}`);
};

// ==================== 字段选项 ====================
// 获取选项列表
export const getFieldOptions = (params) => {
  return request.get('/field-options', { params });
};

// 获取单个选项
export const getFieldOption = (id) => {
  return request.get(`/field-options/${id}`);
};

// 创建选项
export const createFieldOption = (data) => {
  return request.post('/field-options', data);
};

// 更新选项
export const updateFieldOption = (id, data) => {
  return request.put(`/field-options/${id}`, data);
};

// 删除选项
export const deleteFieldOption = (id) => {
  return request.delete(`/field-options/${id}`);
};

// 批量创建/更新选项
export const batchFieldOptions = (data) => {
  return request.post('/field-options/batch', data);
};

// 批量删除选项
export const batchDeleteFieldOptions = (ids) => {
  return request.post('/field-options/batch-delete', { ids });
};

// ==================== 字段配置关联查询 ====================
// 获取完整的字段配置树
export const getFieldConfigTree = (params) => {
  return request.get('/field-config/tree', { params });
};

// 获取某分组下的字段
export const getGroupFields = (groupId, params) => {
  return request.get(`/field-config/groups/${groupId}/fields`, { params });
};

// 获取某字段的所有选项
export const getFieldOptionsById = (fieldId, params) => {
  return request.get(`/field-config/fields/${fieldId}/options`, { params });
};
