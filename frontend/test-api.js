// 简单的测试脚本来验证API端点
const http = require('http');

const postData = JSON.stringify({
  data: {
    version: '1.0.0',
    workspace: {
      userId: 'user_0',
      currentCanvasId: 'canvas1',
      canvases: [],
      canvasTree: []
    },
    timestamp: new Date().toISOString()
  }
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/workspace/save',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`响应主体: ${chunk}`);
  });
  res.on('end', () => {
    console.log('请求完成');
  });
});

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

req.write(postData);
req.end();