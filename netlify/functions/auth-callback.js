// GitHub OAuth Callback 처리
// GitHub에서 받은 인증 코드를 access_token으로 교환하고 Decap CMS에 전달합니다.

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const code = params.code;

  if (!code) {
    return {
      statusCode: 400,
      body: 'Missing code parameter'
    };
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code: code
      })
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      const errorPayload = JSON.stringify(data).replace(/'/g, "\\'");
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Login Error</title></head>
<body>
<script>
  (function() {
    function sendMessage(e) {
      window.opener.postMessage(
        'authorization:github:error:${errorPayload}',
        e.origin
      );
    }
    window.addEventListener('message', sendMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
<p>로그인 실패. 이 창을 닫아주세요.</p>
</body>
</html>`
      };
    }

    const successPayload = JSON.stringify({
      token: data.access_token,
      provider: 'github'
    }).replace(/'/g, "\\'");

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Login Success</title></head>
<body>
<script>
  (function() {
    function sendMessage(e) {
      window.opener.postMessage(
        'authorization:github:success:${successPayload}',
        e.origin
      );
    }
    window.addEventListener('message', sendMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
<p>로그인 성공! 잠시 후 자동으로 닫힙니다.</p>
</body>
</html>`
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: `Error: ${error.message}`
    };
  }
};
