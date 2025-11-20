document.getElementById('generateForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const topic = document.getElementById('topic').value.trim();
  const format = document.getElementById('format').value;
  const messageEl = document.getElementById('message');
  const button = e.target.querySelector('button');

  if (!topic) {
    showMessage('请输入主题', 'error');
    return;
  }

  button.disabled = true;
  showMessage('正在生成，请稍候...', 'info');

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic, format })
    });

    if (response.ok) {
      // 触发文件下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI_${new Date().getTime()}.${format === 'ppt' ? 'pptx' : format === 'word' ? 'docx' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showMessage('✅ 生成成功！文件已开始下载', 'success');
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      showMessage(`❌ 生成失败：${errorData.error || '未知错误'}`, 'error');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showMessage('⚠️ 网络错误，请检查连接或稍后重试', 'error');
  } finally {
    button.disabled = false;
  }
});

function showMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.style.color = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
}