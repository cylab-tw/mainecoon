class Instance
{
    constructor(Instance_URL, Instance_MetaData_URL, WADOType, WADOURI_URL)
    {
        this.Instance_URL = Instance_URL;
        this.Instance_MetaData_URL = Instance_MetaData_URL;
        this.FramesCount = 0;
        this.Frames_URL_List = undefined;
        this.MetaData = {};
        this.Frames = undefined;
        this.WidthCountOfFrame = undefined;
        this.HeightCountOfFrame = undefined;
        this.FramesMap = undefined;
        this.ImageType_isLabel = false;
        this.ImageType_isVolume = false;
        this.WADOType = WADOType;
        this.WADOURI_URL = WADOURI_URL;
    }

    async init()
    {
        this.MetaData = await this.getMetaData();
        this.FramesCount = this.getFramesCount();
        this.Frames_URL_List = await this.getFrames_URL_List();
        this.WidthCountOfFrame = this.getWidthCountOfFrame();
        this.HeightCountOfFrame = this.getHeightCountOfFrame();
        this.FramesMap = this.getFramesMap();
        this.Frames = await this.getFrames();
        this.initImageType();
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

                tempMetaData.NumberOfFrames = response["00280008"].Value[0];                //有幾張Frames
                tempMetaData.Rows = response["00280010"].Value[0];                          //每張小圖的高
                tempMetaData.Columns = response["00280011"].Value[0];                       //每張小圖的寬
                tempMetaData.ImagedVolumeWidth = response["00480001"].Value[0];             //每幀中Row方向的距離，寬度每1毫米多少幀
                tempMetaData.ImagedVolumeHeight = response["00480002"].Value[0];            //每幀中Column方向的距離，高度每1毫米多少幀
                tempMetaData.XOffset = response["00480008"].Value[0]["0040072A"].Value[0];  //在座標系統中X座標偏移的毫米單位量
                tempMetaData.YOffset = response["00480008"].Value[0]["0040073A"].Value[0];  //在座標系統中Y座標偏移的毫米單位量
                
                tempMetaData.ImageType = response["00080008"].Value;
                
                try
                {
                    tempMetaData.TotalPixelMatrixColumns = response["00480006"].Value[0];   //總寬
                    tempMetaData.TotalPixelMatrixRows = response["00480007"].Value[0];      //總高
                }
                catch(e)
                {
                    if(tempMetaData.NumberOfFrames == 1)
                    {
                        tempMetaData.TotalPixelMatrixColumns = tempMetaData.Columns;        //總寬 = 每張小圖的寬
                        tempMetaData.TotalPixelMatrixRows = tempMetaData.Rows;              //總高 = 每張小圖的高
                    }
                }

                if (response.hasOwnProperty("00480102")) //圖片的翻轉參數
                {
                    tempMetaData.ImageOrientation = response["00480102"].hasOwnProperty("Value") ? response["00480102"].Value : undefined;
                }

                MetaData = DeepCopy(tempMetaData);
                resolve(MetaData);
            }
        });
    }

    getFramesMap()
    {
        let tempFramesMap = new FramesMap(this.FramesCount, this.WidthCountOfFrame, this.HeightCountOfFrame, this.MetaData.Rows, this.MetaData.Columns);
        let result = tempFramesMap.getFramesMap();
        return result;
    }

    getFramesCount()
    {
        return this.MetaData.NumberOfFrames;
    }

    getFrames_URL_List()
    {
        let resultList = [];
        
        for (let i = 0; i < this.FramesCount; i++)
        {
            let result = undefined;
            result = this.getFrames_URL(this.Instance_URL, i+1, this.WADOType, this.WADOURI_URL);    //URL 的 index 從1開始
            resultList.push(DeepCopy(result));
        }
        
        return resultList;
    }

    getFrames_URL(Instance_URL, FramesIndex, WADOType, WADOURI_URL)
    {
        let result = undefined;

        if (WADOType == "URI")
            result = WADOURI_URL + "&" + "frameNumber" + "=" + FramesIndex + "&" + "contentType=image/jpeg";
        else
            result = Instance_URL + "/frames/" + FramesIndex + "/rendered"

        return result;
    }

    getFrames()
    {
        return new Promise( async(resolve, reject) => {
            
            let resultList = [];
            
            for (let i = 0; i < this.FramesCount; i++)
            {
                let result = new Frame(this.Frames_URL_List[i], this.MetaData.Rows, this.MetaData.Columns, this.FramesMap[i]);
                resultList.push(DeepCopy(result));
            }
            resolve(resultList);
        });
    }

    getWidthCountOfFrame()
    {
        return Math.ceil(this.MetaData.TotalPixelMatrixColumns / this.MetaData.Columns);
    }
    
    getHeightCountOfFrame()
    {
        return Math.ceil(this.MetaData.TotalPixelMatrixRows / this.MetaData.Rows);
    }

    initImageType()
    {
        let imageTypeList = this.MetaData.ImageType;

        for(let i = 0; i < imageTypeList.length; i++)
        {
            if (imageTypeList[i] == "VOLUME")
            {
                this.ImageType_isVolume = true;
            }
            
            if (imageTypeList[i] == "LABEL")
            {
                this.ImageType_isLabel = true;
            }
        }
    }

}