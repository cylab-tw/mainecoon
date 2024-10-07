import Cookies from 'js-cookie';

export async function getAccessToken() {
    // 检查 Cookie 中是否已有访问令牌
    let oauthToken = Cookies.get('access_token');
    if (oauthToken) {
        return oauthToken;
    }

    const configResponse = await fetch('/oauthConfig.json');
    if (!configResponse.ok) {
        throw new Error('Failed to load config.json');
    }
    const config = await configResponse.json();
    const { enabled, keycloak_url, client_id, client_secret } = config;

    if (enabled) {
        // 从 URL 哈希部分解析授权码
        const hash = window.location.hash.substring(1); // 移除开头的 '#'
        const hashParams = new URLSearchParams(hash);
        const authorizationCode = hashParams.get('code');

        if (authorizationCode) {
            // 使用 authorization_code 流程去获取访问令牌
            const tokenUrl = keycloak_url.replace('/auth', '/token');
            const params = new URLSearchParams({
                'grant_type': 'authorization_code',
                'client_id': client_id,
                'client_secret': client_secret,
                'code': authorizationCode,
                'redirect_uri': 'http://localhost:3000',
            }).toString();

            try {
                const response = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params,
                });

                if (!response.ok) {
                    throw new Error('Failed to obtain access token');
                }

                const data = await response.json();
                Cookies.set('access_token', data.access_token); // 设置令牌的过期时间为 1 天

                // 移除 URL 中的 `code` 参数以防止重复使用
                window.history.replaceState({}, document.title, window.location.pathname);

                return data.access_token;
            } catch (error) {
                console.error('Failed to obtain access token using authorization code', error);
                throw error;
            }
        } else {
            // 如果没有 `code`，则重定向到 Keycloak 登录页面
            const clientId = 'song-yi-raccoon';
            const redirectUri = encodeURIComponent('http://localhost:3000');
            const keycloakUrl = `https://keycloak.dicom.tw/realms/raccoon/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_mode=fragment&response_type=code&scope=openid`;

            window.location.href = keycloakUrl;
        }
    } else {
        return;
    }
}