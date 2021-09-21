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
    }

    CreateInstanceDivs()
    {
        let Instances = this.DicomFile.Study.Series.Instances;
        let InstanceLength = Instances.length;
        
        for (let i = 0; i < InstanceLength; i++)
        {
            let tempInstanceDivID = "InstanceDiv" + i;
            let tempInstanceDiv = new InstanceDiv(this.ViewerElementID, tempInstanceDivID, Instances[i]);
            tempInstanceDiv.init();
            this.InstanceDivs.push(DeepCopy(tempInstanceDiv));
        }
    }
}