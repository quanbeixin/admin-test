import request from './request';

// 获取 AI Prompt 配置
export const getAIPromptConfig = () => {
  return request({
    url: '/ai-config/prompt',
    method: 'get'
  });
};

// 更新 AI Prompt 配置
export const updateAIPromptConfig = (data) => {
  return request({
    url: '/ai-config/prompt',
    method: 'put',
    data
  });
};
