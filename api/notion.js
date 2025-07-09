// 使用ESM模块语法
import fetch from 'node-fetch';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  try {
    // 从环境变量获取配置
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const PLAYER_DB_ID = process.env.PLAYER_DB_ID;
    const TEAM_DB_ID = process.env.TEAM_DB_ID;
    const NOTION_VERSION = '2022-06-28';
    
    const { type, ...body } = req.body;
    
    // 检查环境变量
    if (!NOTION_API_KEY || !PLAYER_DB_ID || !TEAM_DB_ID) {
      return res.status(500).json({ 
        error: '服务器配置错误：缺少必要的环境变量' 
      });
    }
    
    // 根据请求类型选择数据库
    const databaseId = type === 'player' ? PLAYER_DB_ID : TEAM_DB_ID;
    
    // 调用Notion API
    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!notionResponse.ok) {
      const errorText = await notionResponse.text();
      return res.status(notionResponse.status).json({ 
        error: `Notion API错误: ${notionResponse.statusText}`,
        details: errorText
      });
    }
    
    const data = await notionResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('代理服务器错误:', error);
    res.status(500).json({ 
      error: '内部服务器错误',
      details: error.message 
    });
  }
});

export default app;
