window.onload = async function()
{
    var JCG = new JsonConfigGetter("../data/config.json");
    var Config = await JCG.getConfig();
    console.log(Config);
    

}