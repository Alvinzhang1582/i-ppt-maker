// functions/api/generate.js

// 🔑 替换为你自己的阿里云函数计算（FC）公网调用地址
const FC_URL = 'https://your-region-your-account-id.function.compute.aliyuncs.com/2016-08-15/proxy/your-service/your-function/';

export async function onRequest(context) {
  const { request } = context;

  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(FC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...request.headers,
      },
      body: request.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 转发响应，并添加 CORS 头
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (err) {
    console.error('Proxy error:', err);

    // 返回 504 网关超时
    return new Response(
      JSON.stringify({ error: 'Gateway timeout. Please check your FC endpoint.' }),
      {
        status: 504,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
