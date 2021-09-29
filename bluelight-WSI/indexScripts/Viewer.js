class Viewer
{
    constructor(ViewerElementID, DicomFile, dynamic_Mode)
    {
        this.ViewerElementID = ViewerElementID;
        this.DicomFile = DicomFile;
        this.InstanceDivs = [];
        this.CurrentDivIndex = 0;
        this.MouseToolVariables = [];
        this.dynamic_Mode = dynamic_Mode;
    }

    init()
    {
        //讀有幾層 Instance 並創造出 Div
        this.CreateInstanceDivs();
        this.setMouseEvent();
        this.CreateMouseToolVariables();
    }

    CreateInstanceDivs()
    {
        let Instances = this.DicomFile.Study.Series.Instances;
        let InstanceLength = Instances.length;
        for (let i = 0; i < InstanceLength; i++)
        {
            let isSurface = i==0 ? true : false;
            let tempInstanceDivID = "InstanceDiv" + i;
            let tempInstanceDiv = new InstanceDiv(this.ViewerElementID, tempInstanceDivID, Instances[i], isSurface, dynamic_Mode);
            tempInstanceDiv.init();
            this.InstanceDivs.push(DeepCopy(tempInstanceDiv));
        }
    }

    CreateMouseToolVariables()
    {
        let InstanceLength = this.InstanceDivs.length;
        for (let i = 0; i < InstanceLength; i++)
        {
            let tempMouseToolVariables = new MouseToolVariables();
            this.MouseToolVariables.push(DeepCopy(tempMouseToolVariables));
        }
    }

    setMouseEvent()
    {
        setViewerOnMouseWheel();
        setViewerOnMouseDown();
        setViewerOnMouseUp();
    }

    loadShowingCanvas()
    {
        
        let CurrentDivID = this.InstanceDivs[this.CurrentDivIndex].ID;
        let result = {"CurrentDivID" : CurrentDivID,
                      "CurrentDivIndex" : this.CurrentDivIndex,
                      "ShowingCanvas" : []}

        let div = document.getElementById(CurrentDivID);
        let transformMartix = window.getComputedStyle(div).transform;
        let divTransformX = 0;
        let divTransformY = 0;
        if (transformMartix != "none")
        {
            let martixValue = transformMartix.match(/matrix.*\((.+)\)/)[1].split(",");
            divTransformX = martixValue[4]; //可視區域向右    divTransformX   -值越大   想像整個div在移動就很合理了
            divTransformY = martixValue[5]; //可視區域向下    divTransformY   -值越大   想像整個div在移動就很合理了
        }

        let MyViewerElement = document.getElementById(this.ViewerElementID);
        let preLoadingHeight = MyViewerElement.clientHeight;
        let preLoadingWidth = MyViewerElement.clientWidth;

        let XRange = {"min" : -divTransformX - preLoadingWidth, "max" : -divTransformX + preLoadingWidth};
        let YRange = {"min" : -divTransformY - preLoadingHeight, "max" : -divTransformY + preLoadingHeight};
        
        let CurrentDivFrameMap = this.InstanceDivs[this.CurrentDivIndex].Instance.FramesMap
        

        //找出我所設定的可視區域範圍內的Canvas
        for (let i = 0; i < CurrentDivFrameMap.length; i++)
        {
            if (XRange.min <= CurrentDivFrameMap[i].StartXpoint && CurrentDivFrameMap[i].StartXpoint <= XRange.max)
            {
                if (YRange.min <= CurrentDivFrameMap[i].StartYpoint && CurrentDivFrameMap[i].StartYpoint <= YRange.max)
                {
                    let Number = CurrentDivFrameMap[i].ID - 1;
                    let tempShowingCanvas = {"FrameCanvasID": CurrentDivID + "_" + "FrameCanvas" + Number, 
                                             "FrameCanvasNumber": Number};
                    result.ShowingCanvas.push(DeepCopy(tempShowingCanvas));
                }
            }
        }

        //將找出的Canvas進行實體化
        for (let i = 0; i < result.ShowingCanvas.length; i++)
        {
            if (document.getElementById(result.ShowingCanvas[i].FrameCanvasID) == undefined)
            {
                let Instances = this.DicomFile.Study.Series.Instances;
                let tempFrameCanvas = new FrameCanvas(result.CurrentDivID, result.ShowingCanvas[i].FrameCanvasID, Instances[result.CurrentDivIndex].Frames[result.ShowingCanvas[i].FrameCanvasNumber]);
                tempFrameCanvas.init();
                this.InstanceDivs[result.CurrentDivIndex].FrameCanvas.push(DeepCopy(tempFrameCanvas));
            }
        }

        return result;
    }

}

