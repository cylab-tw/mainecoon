class InstanceDiv
{
    constructor(FatherElementID, ID, Instance, isSurface, dynamic_Mode)
    {   
        this.FatherElementID = FatherElementID;
        this.ID = ID;
        this.Instance = Instance;
        this.FrameCanvas = [];
        this.isSurface = isSurface;
        this.Width = 0;
        this.Height = 0;
        this.dynamic_Mode = dynamic_Mode;
        this.divTransformX = 0;
        this.divTransformY = 0;
    }

    async init()
    {
        //創造自己
        this.Create();
        this.Width = this.getWidth();
        this.Height = this.getHeight();

        //讀有幾張 Frame 並創造出 Canvas
        if (dynamic_Mode == false) await this.CreateFrameCanvas();
    }

    Create()
    {
        let FatherElement = document.getElementById(this.FatherElementID);
        let element = document.createElement('DIV');
        element.id = this.ID;
        element.style.display = this.isSurface ? "" : "none";
        element.style.transform = "translate(" + this.divTransformX +"px, " + this.divTransformY + "px)";
        
        /*
        //matrix(1, 0, 0, 1, 0, 0);
        element.style.transform = "matrix("
                                + this.Instance.MetaData.ImageOrientation[0] + "," 
                                + this.Instance.MetaData.ImageOrientation[1] + ","
                                + this.Instance.MetaData.ImageOrientation[2] + ","
                                + this.Instance.MetaData.ImageOrientation[3] + "," 
                                + this.Instance.MetaData.ImageOrientation[4] + ","
                                + this.Instance.MetaData.ImageOrientation[5] + ")";
        */

        element.newMousePointX = 0;
        element.newMousePointY = 0;
        FatherElement.appendChild(element);
    }

    getWidth()
    {
        return this.Instance.WidthCountOfFrame * this.Instance.MetaData.Columns;
    }

    getHeight()
    {
        return this.Instance.HeightCountOfFrame * this.Instance.MetaData.Rows;
    }



    async CreateFrameCanvas()
    {
        let Frames = this.Instance.Frames;
        let FramesLength = Frames.length;
        

        //每50個停下來一下
        let needAmount = FramesLength
        let loadedAmount = 0;
        let oneBatchNeedAmount = 50;
        let lastBatchNeedAmount = needAmount % oneBatchNeedAmount;
    
        for (let i = 0; i < needAmount; i++)
        {
            this.CreateSingleFrameCanvas(i);
            if ( i != 0 && i % oneBatchNeedAmount == 0)
            {
                //console.log("每完成50個，等待5秒鐘。");
                loadedAmount += 50;
                await sleep(5000);
            }
        }
        //console.log("還有"+ lastBatchNeedAmount +"個沒完成，現在完成。");
    }

    CreateSingleFrameCanvas(Number)
    {
        let tempFrameCanvasID = this.ID + "_" + "FrameCanvas" + Number;
        let tempFrameCanvas = new FrameCanvas(this.ID, tempFrameCanvasID, this.Instance.Frames[Number]);
        tempFrameCanvas.init();
        this.FrameCanvas.push(DeepCopy(tempFrameCanvas));
    }
}