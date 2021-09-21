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
        this.CreateFrameCanvas();
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

    CreateFrameCanvas()
    {
        let Frames = this.Instance.Frames;
        let FramesLength = Frames.length;

        for (let i = 0; i < FramesLength; i++)
        {
            let tempFrameCanvasID = this.ID + "_" + "FrameCanvas" + i;
            let tempFrameCanvas = new FrameCanvas(this.ID, tempFrameCanvasID, Frames[i]);
            tempFrameCanvas.init();
            this.FrameCanvas.push(DeepCopy(tempFrameCanvas));
        }
    }
}