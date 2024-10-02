export function getAccessToken() {
    const xhr = new XMLHttpRequest();
    const keycloak_url = 'https://keycloak.dicom.tw/realms/raccoon/protocol/openid-connect/token'
    // SONGYI Keycloak
    xhr.open('POST', keycloak_url, false); // false makes it synchronous
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // SONGYI keycloka information
    const params = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': 'song-yi-raccoon',
        'client_secret': 'CKYMOZjlWkLvHe7vvQBHnHvcu6JGWYT4',
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
