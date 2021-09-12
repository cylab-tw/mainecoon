class WSIServer
{
    constructor()
    {
        this.Config = undefined;
    }

    async getConfigValue()
    {
        let JCG = new JsonConfigGetter("../data/config.json");
        let Config = await JCG.getConfig();
        this.Config = Config;
        console.log(this.Config);
    }

    connectToServer()
    {
        this.getConfigValue();
    }

}