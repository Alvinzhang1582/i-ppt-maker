import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: input }),
      });
      const data = await res.json();
      setOutput(data.content);
    } catch (err) {
      setOutput('生成失败，请检查网络或 API 密钥');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI PPT 生成器</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入PPT主题，例如：人工智能的发展"
            className="w-full p-4 border rounded mb-4 h-32"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '生成中...' : '生成PPT'}
          </button>
          {output && (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">生成结果：</h3>
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}