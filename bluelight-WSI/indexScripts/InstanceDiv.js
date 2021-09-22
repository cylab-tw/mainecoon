class InstanceDiv
{
    constructor(FatherElementID, ID, Instance, isSurface)
    {   
        this.FatherElementID = FatherElementID;
        this.ID = ID;
        this.Instance = Instance;
        this.FrameCanvas = [];
        this.isSurface = isSurface;
    }

    async init()
    {
        //創造自己
        this.Create();

        //讀有幾張 Frame 並創造出 Canvas
        await this.CreateFrameCanvas();
    }

    Create()
    {
        let FatherElement = document.getElementById(this.FatherElementID);
        let element = document.createElement('DIV');
        element.id = this.ID;
        element.style.display = this.isSurface ? "" : "none";
        element.newMousePointX = 0;
        element.newMousePointY = 0;
        FatherElement.appendChild(element);
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