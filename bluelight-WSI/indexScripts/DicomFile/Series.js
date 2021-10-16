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
        this.sortInstancesByTotalPixel();
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

                    if (response[i].hasOwnProperty("00400560"))
                    {
                        tempMetaData.SpecimenDescriptionSequence = response[i]["00400560"].hasOwnProperty("Value") ? response[i]["00400560"].Value[0] : undefined;
                    }
                    
                    if (response[i].hasOwnProperty("22000002") && response[i].hasOwnProperty("22000005"))
                    {
                        tempMetaData.LabelText = response[i]["22000002"].hasOwnProperty("Value") ? response[i]["22000002"].Value[0] : undefined;
                        tempMetaData.BarcodeValue = response[i]["22000005"].hasOwnProperty("Value") ? response[i]["22000005"].Value[0] : undefined;
                    }                    
                    
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

    sortInstancesByTotalPixel()
    {
        for (let i = 0; i < this.Instances.length - 1; i++)
		    for (let j = 0; j < this.Instances.length - 1 - i; j++)
            {
                let temp1 = this.Instances[j].MetaData.TotalPixelMatrixRows/100 * this.Instances[j].MetaData.TotalPixelMatrixColumns/100;
                let temp2 = this.Instances[j + 1].MetaData.TotalPixelMatrixRows/100 * this.Instances[j + 1].MetaData.TotalPixelMatrixColumns/100;

                if (temp1 > temp2) 
                {
                    let temp = this.Instances[j];
                    this.Instances[j] = this.Instances[j + 1];
                    this.Instances[j + 1] = temp;
			    }
            }
    }

}