class WSIServer
{
    constructor()
    {
        this.Config = undefined;
        this.DICOMWebServersConfig = undefined;
        
        this.QIDO_URL = undefined;
        this.QIDO_API_URL = undefined;
        this.WADO_URI_API_URL = undefined;

        this.WADOType = undefined;
    }

    async init()
    {
        await this.loadConfigValue();
        await this.combine_QIDO();
        await this.combine_WADO_URI_API_URL();
    }

    async loadConfigValue()
    {
        let JCG = new JsonConfigGetter("../data/config.json");
        let Config = await JCG.getConfig();
        this.Config = Config;
        this.DICOMWebServersConfig = this.Config["DICOMWebServersConfig"][0];
        this.WADOType = this.DICOMWebServersConfig["WADO-RS/RUI"];
    }

    

    async combine_QIDO()
    {
        await this.combine_QIDO_URL();
        await this.combine_QIDO_API_URL();
    }

    async combine_QIDO_URL()
    {
        let url = undefined;
        let StudyInstanceUID = ("" + location.search).replace("?", "");
        let DICOMWebServersConfig = this.DICOMWebServersConfig;
        
        let tempQIDOConfig = {};
        tempQIDOConfig.https = DICOMWebServersConfig["enableHTTPS"] == true ? "https" : "http";
        tempQIDOConfig.hostname = DICOMWebServersConfig["hostname"];
        tempQIDOConfig.port = DICOMWebServersConfig["PORT"];
        tempQIDOConfig.service = DICOMWebServersConfig["QIDO"];
        
        url = tempQIDOConfig.https + "://" 
            + tempQIDOConfig.hostname + ":" 
            + tempQIDOConfig.port + "/" 
            + tempQIDOConfig.service + "/studies" 
            + "?" + StudyInstanceUID; 
        
        this.QIDO_URL = url;
    }

    async combine_QIDO_API_URL()
    {
        let url = undefined;
        let DICOMWebServersConfig = this.DICOMWebServersConfig;
        
        let tempQIDOConfig = {};
        tempQIDOConfig.https = DICOMWebServersConfig["enableHTTPS"] == true ? "https" : "http";
        tempQIDOConfig.hostname = DICOMWebServersConfig["hostname"];
        tempQIDOConfig.port = DICOMWebServersConfig["PORT"];
        tempQIDOConfig.service = DICOMWebServersConfig["QIDO"];
        
        url = tempQIDOConfig.https + "://" 
            + tempQIDOConfig.hostname + ":" 
            + tempQIDOConfig.port + "/" 
            + tempQIDOConfig.service 
        
        this.QIDO_API_URL = url;
    }

    async combine_WADO_URI_API_URL()
    {
        let url = undefined;
        let DICOMWebServersConfig = this.DICOMWebServersConfig;
        
        let tempQIDOConfig = {};
        tempQIDOConfig.https = DICOMWebServersConfig["enableHTTPS"] == true ? "https" : "http";
        tempQIDOConfig.hostname = DICOMWebServersConfig["hostname"];
        tempQIDOConfig.port = DICOMWebServersConfig["PORT"];
        tempQIDOConfig.service = DICOMWebServersConfig["WADO-URI"];
        
        url = tempQIDOConfig.https + "://" 
            + tempQIDOConfig.hostname + ":" 
            + tempQIDOConfig.port + "/" 
            + tempQIDOConfig.service 
            + "/" + "wado" + "?" + "requestType=WADO";
        
        this.WADO_URI_API_URL = url;
    }


}