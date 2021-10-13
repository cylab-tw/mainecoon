function DeepCopy(obj) 
{
    return JSON.parse(JSON.stringify(obj))
}

function httpAndHttpsReplaceByConfig(url, enableHTTPS)
{
    if (enableHTTPS) url = url.replace("http:", "https:");
    return url;
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

function DateFormat(Date)
{
    //YYYYMMDD to YYYY-MM-DD
    let result = undefined;
    
    let year = Date.substring(0, 4);
    let month = Date.substring(4, 6);
    let day = Date.substring(6, 8);

    result = year + "-" + month + "-" + day;
    return result;
}

function TimeFormat(Time)
{
    //HHmmss to HH:mm:ss
    let result = undefined;

    let hour = Time.substring(0, 2);
    let min = Time.substring(2, 4);
    let second = Time.substring(4, 6);

    result = hour + ":" + min + ":" + second;
    return result;
}