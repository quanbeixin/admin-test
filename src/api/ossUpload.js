import OSS from 'ali-oss';
import request from './request';

/**
 * 获取OSS临时授权凭证
 */
export const getSTSToken = () => {
  return request.get('/oss/sts-token');
};

/**
 * 直接上传文件到OSS
 * @param {File} file - 要上传的文件
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise<string>} 返回文件的OSS URL
 */
export const uploadFileDirectly = async (file, onProgress) => {
  try {
    // 1. 获取临时授权凭证
    const tokenResponse = await getSTSToken();
    const { region, bucket, accessKeyId, accessKeySecret, stsToken } = tokenResponse.data;

    // 2. 创建OSS客户端
    const client = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      stsToken,
      secure: true, // 使用HTTPS
    });

    // 3. 生成文件名
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const filename = `${timestamp}_${random}${ext}`;
    const objectName = `uploads/${filename}`;

    // 4. 上传文件
    const result = await client.put(objectName, file, {
      progress: (p) => {
        if (onProgress) {
          onProgress(Math.floor(p * 100));
        }
      },
    });

    console.log('OSS上传成功:', result.url);
    return result.url;
  } catch (error) {
    console.error('OSS直接上传失败:', error);
    throw error;
  }
};

/**
 * 批量上传文件到OSS
 * @param {File[]} files - 要上传的文件数组
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise<string[]>} 返回文件URL数组
 */
export const uploadMultipleDirectly = async (files, onProgress) => {
  try {
    // 1. 获取临时授权凭证
    const tokenResponse = await getSTSToken();
    const { region, bucket, accessKeyId, accessKeySecret, stsToken } = tokenResponse.data;

    // 2. 创建OSS客户端
    const client = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      stsToken,
      secure: true,
    });

    // 3. 上传所有文件
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const filename = `${timestamp}_${random}_${index}${ext}`;
      const objectName = `uploads/${filename}`;

      const result = await client.put(objectName, file, {
        progress: (p) => {
          if (onProgress) {
            onProgress(index, Math.floor(p * 100));
          }
        },
      });

      return result.url;
    });

    const urls = await Promise.all(uploadPromises);
    console.log('批量上传成功:', urls);
    return urls;
  } catch (error) {
    console.error('批量上传失败:', error);
    throw error;
  }
};
