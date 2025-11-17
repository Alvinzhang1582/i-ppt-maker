import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "topic"' });
  }

  // ✅ 使用 \n 换行，避免模板字符串解析问题
  const mockContent = `主题：${topic}\n\n# ${topic}\n\n## 1. 引言\n简要介绍 ${topic} 的背景和重要性。\n\n## 2. 核心要点\n- 关键概念一\n- 关键概念二\n- 关键概念三\n\n## 3. 应用场景\n实际应用案例或使用场景。\n\n## 4. 总结与展望\n未来发展走势和建议。`;

  return res.status(200).json({
    success: true,
    content: mockContent.trim(),
  });
}