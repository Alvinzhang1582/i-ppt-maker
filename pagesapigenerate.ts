import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key 未配置' });
  }

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-max',
        input: {
          messages: [
            { role: 'system', content: '你是一个专业的PPT内容生成助手。' },
            { role: 'user', content: `请为以下主题生成一份PPT大纲和内容：${topic}` },
          ],
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data.output.choices[0].message.content;
    res.status(200).json({ content: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '请求失败，请检查API密钥或网络' });
  }
}