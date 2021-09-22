class Viewer
{
    constructor(ViewerElementID, DicomFile)
    {
        this.ViewerElementID = ViewerElementID;
        this.DicomFile = DicomFile;
        this.InstanceDivs = [];
        this.CurrentDivIndex = 0;
        this.MouseToolVariables = [];
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
        InstanceLength = 4;
        for (let i = 0; i < InstanceLength; i++)
        {
            let isSurface = i==0 ? true : false;
            let tempInstanceDivID = "InstanceDiv" + i;
            let tempInstanceDiv = new InstanceDiv(this.ViewerElementID, tempInstanceDivID, Instances[i], isSurface);
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
        this.setOnClick();
        this.setOnMouseWheel();
        setViewerOnMouseDown();
        setViewerOnMouseUp();
    }

    setOnClick()
    {
        document.getElementById(ViewerElementID).onclick = function()
        {
            console.log("你有在Viewer點了一下囉");
        }
    }

    setOnMouseWheel()
    {   
        setViewerOnMouseWheel();
    }
}

