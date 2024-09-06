export function getAccessToken() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://172.18.0.58:8080/realms/mitw/protocol/openid-connect/token', false); // false makes it synchronous
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    const params = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': 'dcm4chee',
        'client_secret': 'v6uYKjl6UDXFhe7ebPBGwOILQ01GYRQg',
        'scope': 'openid'
    }).toString();

    xhr.send(params);

    if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log(response.access_token);
        return response.access_token;
    } else {
        console.error('Failed to obtain access token');
        throw new Error('Failed to obtain access token');
    }
}