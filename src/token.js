import Cookies from 'js-cookie';

export async function getAccessToken() {
    // 使用 fetch 加載 config.json 配置
    const configResponse = await fetch('/oauthConfig.json');
    if (!configResponse.ok) {
        throw new Error('Failed to load config.json');
    }

    const config = await configResponse.json();

    // 取得 config 中 Keycloak 的資訊
    const { enabled, keycloak_url, client_id, client_secret, username, password } = config;

    if (enabled) {
        const xhr = new XMLHttpRequest();
        // SONGYI Keycloak
        xhr.open('POST', keycloak_url, false); // false makes it synchronous
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // SONGYI keycloak information Password Credentials
        const params = new URLSearchParams({
            'grant_type': 'password',
            'client_id': client_id,
            'client_secret': client_secret,
            'username': username,
            'password': password,
            'scope': 'openid'
        }).toString();

        // // SONGYI keycloak information Client Credentials
        // const params = new URLSearchParams({
        //     'grant_type': 'password',
        //     'client_id': client_id,
        //     'client_secret': client_secret,
        //     'scope': 'openid'
        // }).toString();

        xhr.send(params);

    if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        // console.log(response.access_token);
        Cookies.set('access_token', response.access_token);
        return response.access_token;
    } else {
        return;
    }
}
