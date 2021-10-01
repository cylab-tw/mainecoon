class JsonConfigGetter
{
    constructor(url)
    {
        this.url = url;
    }

    getConfig()
    {
        return new Promise((resolve, reject) => {
            let config = {};
            let request = new XMLHttpRequest();
            request.open('GET', this.url);
            request.responseType = 'json';
            request.send();
            request.onload = function ()
            {
                let tempConfig = {}
                tempConfig = request.response;
                config = DeepCopy(tempConfig);
                resolve(config);
            }
        });
    }
}