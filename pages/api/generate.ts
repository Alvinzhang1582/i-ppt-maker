import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // 使用 Edge Runtime（更快、免费）

// ✅ 添加 default export
export default async function handler(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: '缺少主题参数' }, { status: 400 });
    }

    // 构造给大模型的提示词（强制返回 JSON）
    const prompt = `
你是专业的 PPT 内容生成器。请根据用户提供的主题，生成一个简洁、有逻辑的 PPT 大纲。
要求：
- 包含 4~6 页
- 第一页必须是“封面”，内容只包含主题名称
- 每页有标题（title）和要点列表（content，2~4 条）
- 用纯 JSON 格式输出，不要任何解释、不要 Markdown
- 字段名必须是 "slides"，每个 slide 有 "title" 和 "content"

主题：${topic}
`;

    // 调用通义千问（Qwen）API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [{ role: 'user', content: prompt }],
        },
        parameters: {
          result_format: 'message',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DashScope Error:', errText);
      return NextResponse.json({ error: 'AI 服务调用失败' }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.output.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json({ error: 'AI 未返回内容' }, { status: 500 });
    }

    // 尝试解析 AI 返回的 JSON
    let parsed;
    try {
      // Qwen 有时会包裹在 ```json ... ``` 中，先清理
      const cleanJson = aiResponse.replace(/```json\s*|\s*```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error('JSON Parse Error:', aiResponse);
      return NextResponse.json(
        { error: 'AI 返回格式错误，请重试', raw: aiResponse },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}