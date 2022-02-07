class OpenSeadragonConfiger
{
    constructor(DicomFile, ViewerHtmlID)
    {
        this.DicomFile = DicomFile;
        this.ViewerHtmlID = ViewerHtmlID;
        this.showNavigationControl = false;
        this.tileSources = undefined;
    }

    async init()
    {
        await this.loadConfigValue();
    }

    async loadConfigValue()
    {
        let JCG = new JsonConfigGetter("../data/testOpenSeadragonImageInfo.json");
        let Config = await JCG.getConfig();
        this.tileSources = Config;
    }

    getConfig()
    {
        let result = 
        {
            id : this.ViewerHtmlID,
            showNavigationControl: this.showNavigationControl,
            tileSources: this.tileSources
        };

        return result;
    }
}