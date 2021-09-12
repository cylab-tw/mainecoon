class WSIServer
{
    constructor()
    {
        this.Config = undefined;
        this.DICOMWebServersConfig = undefined;
        this.QIDO_Url = undefined;
    }

    async loadConfigValue()
    {
        let JCG = new JsonConfigGetter("../data/config.json");
        let Config = await JCG.getConfig();
        this.Config = Config;
        this.DICOMWebServersConfig = this.Config["DICOMWebServersConfig"][0];
    }

    async combine_QIDO_Url()
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
        
        this.QIDO_Url = url;
    }

    async connectToWSIServer()
    {
        await this.loadConfigValue();
        await this.combine_QIDO_Url();
        await this.connectingWSIServer();
    }

    async connectingWSIServer()
    {
        let DICOMWebServersConfig = this.DICOMWebServersConfig;

        let request = new XMLHttpRequest();
        request.open('GET', this.QIDO_Url);
        request.responseType = 'json';
        request.send();
        request.onload = function getDicomDataByStudy() 
        {
            let DicomStudyResponse = request.response;
            let seriesCounter = DicomStudyResponse.length;

            for (let seriesIndex = 0; seriesIndex < seriesCounter; seriesIndex++)
            {
                let SeriesUrl = DicomStudyResponse[seriesIndex]["00081190"].Value[0] + "/series";
                if (DICOMWebServersConfig["enableHTTPS"]) SeriesUrl = SeriesUrl.replace("http:", "https:");
                let SeriesRequest = new XMLHttpRequest();
                SeriesRequest.open('GET', SeriesUrl);
                SeriesRequest.responseType = 'json';
                SeriesRequest.send();
                SeriesRequest.onload = function getDicomDataBySeries()
                {
                    let DicomSeriesResponse = SeriesRequest.response;
                    let imagesCounter = DicomSeriesResponse.length;
                    
                    for(let imagesIndex = 0; imagesIndex < imagesCounter; imagesIndex++)
                    {
                        let imageUrl = undefined;                        
                        let tempWADOConfig = {};
                        tempWADOConfig.https = DICOMWebServersConfig["enableHTTPS"] == true ? "https" : "http";
                        tempWADOConfig.hostname = DICOMWebServersConfig["hostname"];
                        tempWADOConfig.port = DICOMWebServersConfig["PORT"];
                        tempWADOConfig.service = DICOMWebServersConfig["WADO-RS"];

                        imageUrl = tempWADOConfig.https + "://" 
                                 + tempWADOConfig.hostname + ":" 
                                 + tempWADOConfig.port + "/"  
                                 + tempWADOConfig.service 
                                 + "/studies/" + DicomSeriesResponse[imagesIndex]["0020000D"].Value[0]
                                 + "/series/" + DicomSeriesResponse[imagesIndex]["0020000E"].Value[0];
                        console.log(imageUrl);
                        
                    }
                }
            }
        }
    }
}