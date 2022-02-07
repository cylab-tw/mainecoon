class OpenSeadragonConfiger
{
    constructor(DicomFile, ViewerHtmlID)
    {
        //DICOM part
        this.DicomFile = DicomFile;
        this.ImageTypeIsVolumeInstances = DicomFile.Study.Series.ImageTypeIsVolumeInstances;

        //OpenSeadragon Part
        this.ViewerHtmlID = ViewerHtmlID;
        this.showNavigationControl = false;
        this.showNavigator = true;
        this.navigatorId = "NavigatorDiv";
        this.squareTileSize = undefined;
        this.minLevel = undefined;
        this.maxLevel = undefined;
        this.maxLevelHeightImageCount = undefined;
        this.maxLevelWidthImageCount = undefined;
        this.height = undefined
        this.width = undefined;
    }

    async init()
    {
        await this.loadTileSourcesInformation();
    }

    async loadTileSourcesInformation()
    {
        this.squareTileSize = await this.getSquareTileSize();
        this.minLevel = await this.getMinLevel();
        this.maxLevel = await this.getMaxLevel();
        this.maxLevelHeightImageCount = await this.getMaxLevelHeightImageCount();
        this.maxLevelWidthImageCount = await this.getMaxLevelWidthImageCount();
        this.height = await this.getHeight();
        this.width = await this.getWidth();
    }

    async getSquareTileSize()
    {
        let instancesMaxIndex = this.ImageTypeIsVolumeInstances.length - 1;
        let lastInstance = this.ImageTypeIsVolumeInstances[instancesMaxIndex];
        let result = lastInstance.MetaData.Columns == lastInstance.MetaData.Rows ? lastInstance.MetaData.Columns : 0;
        
        return result;
    }
    
    async getMinLevel()
    {
        let result = 0;
        
        return result;
    }

    async getMaxLevel()
    {
        let result = this.ImageTypeIsVolumeInstances.length - 1;
        
        return result;
    }


    async getMaxLevelHeightImageCount()
    {
        let instancesMaxIndex = this.ImageTypeIsVolumeInstances.length - 1;
        let lastInstance = this.ImageTypeIsVolumeInstances[instancesMaxIndex];

        let result = lastInstance.HeightCountOfFrame;
        
        return result;
    }
    
    async getMaxLevelWidthImageCount()
    {
        let instancesMaxIndex = this.ImageTypeIsVolumeInstances.length - 1;
        let lastInstance = this.ImageTypeIsVolumeInstances[instancesMaxIndex];

        let result = lastInstance.WidthCountOfFrame;
        
        return result;
    }

    async getHeight()
    {
        let result = this.maxLevelHeightImageCount * this.squareTileSize
        
        return result;
    }

    async getWidth()
    {
        let result = this.maxLevelWidthImageCount * this.squareTileSize
        
        return result;
    }




    getConfig()
    {
        let ImageTypeIsVolumeInstances = this.ImageTypeIsVolumeInstances;

        let result = 
        {
            id : this.ViewerHtmlID,
            showNavigationControl: this.showNavigationControl,
            showNavigator :  this.showNavigator,
            navigatorId : this.navigatorId,
            tileSources: 
            {
                height : this.height,
                width :  this.width,
                tileSize : this.squareTileSize,
                minLevel : this.minLevel,
                maxLevel : this.maxLevel,
                getTileUrl : function(level, x, y)
                {
                    let widthImageCount = ImageTypeIsVolumeInstances[level].WidthCountOfFrame;
                    // console.log("level = " + level + "\n" + 
                    //             "x = " + x + "\n" + 
                    //             "y = " + y + "\n" + 
                    //             "widthImageCount = " + widthImageCount + "\n" + 
                    //             "x + y * widthImageCount = " + (x + y * widthImageCount) + "\n" +
                    //             "URL = " + ImageTypeIsVolumeInstances[level].Frames_URL_List[x + y * widthImageCount]);
                    // console.log(ImageTypeIsVolumeInstances[level]);
                    return ImageTypeIsVolumeInstances[level].Frames_URL_List[x + y * widthImageCount];
                }
            }
        };

        return result;
    }
}