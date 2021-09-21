class Viewer
{
    constructor(ViewerElementID, DicomFile)
    {
        this.ViewerElementID = ViewerElementID;
        this.DicomFile = DicomFile;
        this.InstanceDivs = [];
    }

    init()
    {
        //讀有幾層 Instance 並創造出 Div
        this.CreateInstanceDivs();
        this.setViewerElementOnClick();
    }

    CreateInstanceDivs()
    {
        let Instances = this.DicomFile.Study.Series.Instances;
        let InstanceLength = Instances.length;
        InstanceLength = 4;
        for (let i = 0; i < InstanceLength; i++)
        {
            let isSuface = i==0 ? true : false;
            let tempInstanceDivID = "InstanceDiv" + i;
            let tempInstanceDiv = new InstanceDiv(this.ViewerElementID, tempInstanceDivID, Instances[i], isSuface);
            tempInstanceDiv.init();
            this.InstanceDivs.push(DeepCopy(tempInstanceDiv));
        }
    }

    setViewerElementOnClick()
    {
        document.getElementById(ViewerElementID).onclick = function()
        {
            console.log("你有在Viewer點了一下囉");
        }
    }
}