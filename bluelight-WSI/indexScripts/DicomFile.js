class DicomFile
{
    constructor(QIDO_Url)
    {
        this.QIDO_Url = QIDO_Url;
        this.Study_URL = undefined;
        this.Study_MetaData_URL = undefined;
        this.MetaData = {};
    }

    async init()
    {
        this.MetaData = await this.getMetaData();
        await this.combine_Study_URL();
        await this.combine_Study_MetaData_URL();
    }

    async getMetaData()
    {
        return new Promise((resolve, reject) => {
            let MetaData = {};
            let request = new XMLHttpRequest();
            request.open('GET', this.QIDO_Url);
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

    async combine_Study_URL()
    {
        this.Study_URL = this.MetaData.RetrieveURL.Value[0];
    }

    async combine_Study_MetaData_URL()
    {
        this.Study_MetaData_URL = this.Study_URL + "/series";
    }
}