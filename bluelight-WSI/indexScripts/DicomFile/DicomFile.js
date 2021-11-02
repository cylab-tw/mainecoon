class DicomFile
{
    constructor(WSIServer)
    {
        this.WSIServer = WSIServer;
        this.QIDO_URL = WSIServer.QIDO_URL;
        this.Study_URL = undefined;
        this.Study_MetaData_URL = undefined;
        this.MetaData = {};
        this.Study = undefined;
        this.WADOType = this.WSIServer.WADOType;
        this.WADOURI_URL = undefined;
    }

    async init()
    {
        this.MetaData = await this.getMetaData();
        this.combine_Study_URL();
        this.combine_Study_MetaData_URL();
        this.combine_WADOURI_URL();
        this.Study = await this.getStudy();
    }

    async getMetaData()
    {
        return new Promise((resolve, reject) => {
            let MetaData = {};
            let request = new XMLHttpRequest();
            request.open('GET', this.QIDO_URL);
            request.responseType = 'json';
            request.send();
            request.onload = function () 
            {
                let response = request.response[0];
                let tempMetaData = {};
                tempMetaData.SpecificCharacterSet = response["00080005"];
                tempMetaData.StudyDate = response["00080020"];
                tempMetaData.StudyTime = response["00080030"];
                tempMetaData.AccessionNumber = response["00080050"];
                tempMetaData.InstanceAvailability = response["00080056"];
                tempMetaData.ModalitiesInStudy = response["00080061"];
                tempMetaData.ReferringPhysicianName = response["00080090"];
                tempMetaData.TimezoneOffsetFromUTC = response["00080201"];
                tempMetaData.RetrieveURL = response["00081190"];
                tempMetaData.PatientName = response["00100010"];
                tempMetaData.PatientID = response["00100020"];
                tempMetaData.PatientBirthDate = response["00100030"];
                tempMetaData.PatientSex = response["00100040"];
                tempMetaData.StudyInstanceUID = response["0020000D"];
                tempMetaData.StudyID = response["00200010"];
                tempMetaData.NumberOfStudyRelatedSeries = response["00201206"];
                tempMetaData.NumberOfStudyRelatedInstances = response["00201208"];
                
                MetaData = DeepCopy(tempMetaData);
                resolve(MetaData);
            }
        });        
    }

    combine_Study_URL()
    {
        this.Study_URL = this.WSIServer.QIDO_API_URL + "/studies/" + this.MetaData.StudyInstanceUID.Value[0];
        this.Study_URL = httpAndHttpsReplaceByConfig(this.Study_URL, this.WSIServer.DICOMWebServersConfig["enableHTTPS"]);
    }

    combine_Study_MetaData_URL()
    {
        this.Study_MetaData_URL = this.Study_URL + "/series";
        this.Study_MetaData_URL = httpAndHttpsReplaceByConfig(this.Study_MetaData_URL, this.WSIServer.DICOMWebServersConfig["enableHTTPS"]);
    }

    combine_WADOURI_URL()
    {
        this.WADOURI_URL = this.WADOType == "URI" ? this.WSIServer.WADO_URI_API_URL + "&studyUID=" + this.MetaData.StudyInstanceUID.Value[0] : undefined;
    }

    getStudy()
    {
        return new Promise( async(resolve, reject) => {
            let result = {};
            let tempResult = new Study(this.Study_URL, this.Study_MetaData_URL, this.WADOType, this.WADOURI_URL);
            await tempResult.init();
            result = DeepCopy(tempResult);
            resolve(result);
        });        
    }
}