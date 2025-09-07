const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Slott聊天服务器运行中\n');
});

const wss = new WebSocket.Server({ server });
const onlineUsers = new Set();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'join') {
        onlineUsers.add(data.user);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'user_joined',
              user: data.user,
              onlineCount: onlineUsers.size
            }));
          }
        });
      }
      else if (data.type === 'message') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              user: data.user,
              text: data.text,
              timestamp: new Date().toLocaleTimeString()
            }));
          }
        });
      }
    } catch (error) {
      console.log('消息解析错误:', error);
    }
  });

  ws.on('close', () => {
    console.log('用户断开连接');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
