class Series
{
    constructor(Series_URL, Series_MetaData_URL)
    {
        this.Series_URL = Series_URL;
        this.Series_MetaData_URL = Series_MetaData_URL;
        this.InstancesCount = 0;
        this.Instances_URL_List = undefined;
        this.Instances_MetaData_URL_List = undefined;
        this.MetaData = {};
        this.Instances = undefined;
    }

    async init()
    {
        this.MetaData = await this.getMetaData();
        this.calInstancesCount();
        this.Instances_URL_List = this.getInstances_URL_List();
        this.Instances_MetaData_URL_List = this.getInstances_MetaData_URL_List();
        this.Instances = await this.getInstances();
        this.sortInstancesByNumberOfFrames();
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
            result = this.getInstances_URL(this.Series_URL, this.MetaData[i].SOPInstanceUID);
            resultList.push(DeepCopy(result));
        }

        return resultList;
    }

    getInstances_URL(Series_URL, SOPInstanceUID)
    {
        return Series_URL + "/instances/" + SOPInstanceUID;
    }

    getInstances_MetaData_URL_List()
    {
        let resultList = [];
        
        for (let i = 0; i < this.InstancesCount; i++)
        {
            let result = undefined;
            result = this.getInstances_MetaData_URL(this.Series_URL, this.MetaData[i].SOPInstanceUID);
            resultList.push(DeepCopy(result));
        }

        return resultList;
    }

    getInstances_MetaData_URL(Series_URL, SOPInstanceUID)
    {
        return this.getInstances_URL(Series_URL, SOPInstanceUID) + "/metadata";
    }

    getInstances()
    {
        return new Promise( async(resolve, reject) => {
            
            let resultList = [];
            
            for (let i = 0; i < this.InstancesCount; i++)
            {
                let result = new Instance(this.Instances_URL_List[i], this.Instances_MetaData_URL_List[i]);
                await result.init();
                resultList.push(DeepCopy(result));
            }
            resolve(resultList);
        }); 
    }

    sortInstancesByNumberOfFrames()
    {
        for (let i = 0; i < this.Instances.length - 1; i++)
		    for (let j = 0; j < this.Instances.length - 1 - i; j++)
			    if (this.Instances[j].MetaData.NumberOfFrames > this.Instances[j + 1].MetaData.NumberOfFrames) 
                {
                    let temp = this.Instances[j];
                    this.Instances[j] = this.Instances[j + 1];
                    this.Instances[j + 1] = temp;
			    }
    }

}