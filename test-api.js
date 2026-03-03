// 测试后端 API
const axios = require('axios');

async function testAPI() {
  try {
    // 从 localStorage 获取 token（需要手动替换）
    const token = 'YOUR_TOKEN_HERE'; // 请替换为实际的 token

    const response = await axios.get('http://localhost:5173/api/test-cases', {
      params: {
        page: 1,
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('成功:', response.data);
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
  }
}

testAPI();
