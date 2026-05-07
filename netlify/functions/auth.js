// GitHub OAuth 로그인 시작
// 사용자를 GitHub의 권한 승인 페이지로 이동시킵니다.

exports.handler = async (event) => {
  const clientId = process.env.OAUTH_CLIENT_ID;

  if (!clientId) {
    return {
      statusCode: 500,
      body: 'OAUTH_CLIENT_ID 환경 변수가 설정되지 않았습니다.'
    };
  }

  const host = event.headers.host;
  const protocol = event.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${protocol}://${host}/.netlify/functions/auth-callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=repo,user` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return {
    statusCode: 302,
    headers: { Location: githubAuthUrl }
  };
};
