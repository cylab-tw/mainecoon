class Instance
{
    constructor(Instance_URL, Instance_MetaData_URL)
    {
        this.Instance_URL = Instance_URL;
        this.Instance_MetaData_URL = Instance_MetaData_URL;
        this.FramesCount = 0;
        this.Frames_URL_List = undefined;
        this.Frames_MetaData_URL_List = undefined;
        this.MetaData = {};
        this.Frames = undefined;
    }

    async init()
    {
        this.MetaData = await this.getMetaData();
        this.FramesCount = this.getFramesCount();
    }

    async getMetaData()
    {
        return new Promise((resolve, reject) => {
            let MetaData = {};
            let request = new XMLHttpRequest();
            request.open('GET', this.Instance_MetaData_URL);
            request.responseType = 'json';
            request.send();
            request.onload = function () 
            {
                let response = request.response[0];
                let tempMetaData = {};
                
                tempMetaData.Rows = response["00280010"].Value[0];                      //每張小圖的寬
                tempMetaData.Columns = response["00280011"].Value[0];                   //每張小圖的高
                tempMetaData.TotalPixelMatrixColumns = response["00480006"].Value[0];   //總高
                tempMetaData.TotalPixelMatrixRows = response["00480007"].Value[0];      //總寬
                tempMetaData.NumberOfFrames = response["00280008"].Value[0];            //有幾張Frames

                MetaData = DeepCopy(tempMetaData);
                resolve(MetaData);
            }
        });
    }

    getFramesCount()
    {
        return this.MetaData.NumberOfFrames;
    }

}