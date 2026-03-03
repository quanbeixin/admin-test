import request from './request';

// 获取测试用例列表
export const getTestCases = (params) => {
  return request.get('/test-cases', { params });
};

// 获取单个测试用例
export const getTestCase = (id) => {
  return request.get(`/test-cases/${id}`);
};

// 创建测试用例
export const createTestCase = (data) => {
  return request.post('/test-cases', data);
};

// 更新测试用例
export const updateTestCase = (id, data) => {
  return request.put(`/test-cases/${id}`, data);
};

// 删除测试用例
export const deleteTestCase = (id) => {
  return request.delete(`/test-cases/${id}`);
};

// 执行测试
export const runTest = (data) => {
  return request.post('/test/run', data);
};

// 获取测试任务结果（包含状态和详细结果）
export const getTaskResult = (taskId) => {
  return request.get(`/test/task/${taskId}`);
};

// 获取测试任务列表
export const getTaskList = (params) => {
  return request.get('/test/tasks', { params });
};

// 获取测试任务详情
export const getTaskDetail = (taskId) => {
  return request.get(`/test/tasks/${taskId}`);
};
