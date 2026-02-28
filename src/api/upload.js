import request from './request';

// 单文件上传
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return request.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 多文件上传
export const uploadMultiple = (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return request.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
