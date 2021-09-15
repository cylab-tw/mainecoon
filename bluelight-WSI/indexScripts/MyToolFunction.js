function DeepCopy(obj) 
{
    return JSON.parse(JSON.stringify(obj))
}

function httpAndHttpsReplaceByConfig(url, enableHTTPS)
{
    if (enableHTTPS) url = url.replace("http:", "https:");
    return url;
}