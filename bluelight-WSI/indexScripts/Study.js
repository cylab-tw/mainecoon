class Study
{
    constructor(Study_URL, Study_MetaData_URL)
    {
        this.Study_URL = Study_URL;
        this.Study_MetaData_URL = Study_MetaData_URL;
        this.Series_URL = undefined;
        this.Series_MetaData_URL = undefined;
        this.MetaData = {};
        this.Series = undefined;
    }

    async init()
    {
        this.MetaData = await this.getMetaData();
        this.combine_Series_URL();
        this.combine_Series_MetaData_URL();
        this.Series = await this.getSeries();
    }

    async getMetaData()
    {
        return new Promise((resolve, reject) => {
            let MetaData = {};
            let request = new XMLHttpRequest();
            request.open('GET', this.Study_MetaData_URL);
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
                tempMetaData.Modality = response["00080060"];
                tempMetaData.ModalitiesInStudy = response["00080061"];
                tempMetaData.ReferringPhysicianName = response["00080090"];
                tempMetaData.TimezoneOffsetFromUTC = response["00080201"];
                tempMetaData.RetrieveURL = response["00081190"];
                tempMetaData.PatientName = response["00100010"];
                tempMetaData.PatientID = response["00100020"];
                tempMetaData.PatientBirthDate = response["00100030"];
                tempMetaData.PatientSex = response["00100040"];
                tempMetaData.StudyInstanceUID = response["0020000D"];
                tempMetaData.SeriesInstanceUID = response["0020000E"];
                tempMetaData.StudyID = response["00200010"];
                tempMetaData.SeriesNumber = response["00200011"];
                tempMetaData.NumberOfStudyRelatedSeries = response["00201206"];
                tempMetaData.NumberOfStudyRelatedInstances = response["00201208"];
                tempMetaData.PerformedProcedureStepStartDate = response["00400244"];
                tempMetaData.RequestAttributesSequence = response["00400275"];

                MetaData = DeepCopy(tempMetaData);
                resolve(MetaData);
            }
        });
    }

    combine_Series_URL()
    {
        this.Series_URL = this.Study_URL + "/series/" + this.MetaData.SeriesInstanceUID.Value[0];
    }

    combine_Series_MetaData_URL()
    {
        this.Series_MetaData_URL = this.Series_URL + "/metadata";
    }

    getSeries()
    {
        return new Promise( async(resolve, reject) => {
            let result = {};
            let tempResult = new Series(this.Series_URL, this.Series_MetaData_URL);
            await tempResult.init();
            result = DeepCopy(tempResult);
            resolve(result);
        }); 
    }
}