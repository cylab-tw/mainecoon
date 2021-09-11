class JsonConfigGetter
{
    constructor(url)
    {
        this.url = url;
    }

    getConfig()
    {
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
        }
        console.log(config);
        return config;
    }
}

function DeepCopy(obj) 
{
    return JSON.parse(JSON.stringify(obj))
}