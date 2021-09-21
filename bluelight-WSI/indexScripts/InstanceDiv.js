class InstanceDiv
{
    constructor(FatherElementID, ID, Instance)
    {   
        this.FatherElementID = FatherElementID;
        this.ID = ID;
        this.Instance = Instance;
        this.FrameCanvas = [];
    }

    init()
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
        element.style.display = "none";
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