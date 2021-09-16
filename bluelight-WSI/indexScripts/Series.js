class Series
{
    constructor(Study_URL, Series_MetaData_URL)
    {
        this.Study_URL = Study_URL;
        this.Series_MetaData_URL = Series_MetaData_URL;
        this.InstancesCount = 0;
        this.Instances_URL_List = undefined;
        this.Instances_MetaData_URL_List = undefined;
        this.MetaData = {};
        this.Frames = undefined;
    }

    async init()
    {
        this.MetaData = await this.getMetaData();
        this.calInstancesCount();
        this.Instances_URL_List = this.getInstances_URL_List();
        this.Instances_MetaData_URL_List = this.getInstances_MetaData_URL_List();
    }

    async getMetaData() //目前只抓取 SOPInstanceUID 以達成抓取 Instances 的目的
    {
        return new Promise((resolve, reject) => {
            let MetaData = {};
            let request = new XMLHttpRequest();
            request.open('GET', this.Series_MetaData_URL);
            request.responseType = 'json';
            request.send();
            request.onload = function () 
            {
                let response = request.response;
                let InstancesCount = response.length;
                let tempMetaDataList = [];
                
                for (let i = 0; i < InstancesCount; i++)
                {
                    let tempMetaData = {};
                    tempMetaData.SOPInstanceUID = response[i]["00080018"].Value[0];
                    tempMetaDataList.push(DeepCopy(tempMetaData));
                }

                MetaData = DeepCopy(tempMetaDataList);
                resolve(MetaData);
            }
        });
    }

    calInstancesCount()
    {
        this.InstancesCount = this.MetaData.length;
    }

    getInstances_URL_List()
    {
        let resultList = [];

        for (let i = 0; i < this.InstancesCount; i++)
        {
            let result = undefined;
            result = this.getInstances_URL(this.Study_URL, this.MetaData[i].SOPInstanceUID);
            resultList.push(DeepCopy(result));
        }

        return resultList;
    }

    getInstances_URL(Study_URL, SOPInstanceUID)
    {
        return Study_URL + "/instances/" + SOPInstanceUID;
    }

    getInstances_MetaData_URL_List()
    {
        let resultList = [];
        
        for (let i = 0; i < this.InstancesCount; i++)
        {
            let result = undefined;
            result = this.getInstances_MetaData_URL(this.Study_URL, this.MetaData[i].SOPInstanceUID);
            resultList.push(DeepCopy(result));
        }

        return resultList;
    }

    getInstances_MetaData_URL(Study_URL, SOPInstanceUID)
    {
        return this.getInstances_URL(Study_URL, SOPInstanceUID) + "/metadata";
    }


}