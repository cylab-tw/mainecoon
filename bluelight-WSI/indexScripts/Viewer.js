class Viewer
{
    constructor(ViewerElementID, DicomFile)
    {
        this.ViewerElementID = ViewerElementID;
        this.DicomFile = DicomFile;
        this.InstanceDivs = [];
        this.CurrentDivIndex = 0;
    }

    init()
    {
        //讀有幾層 Instance 並創造出 Div
        this.CreateInstanceDivs();
        this.setMouseEvent();
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

    setMouseEvent()
    {
        this.setOnClick();
        this.setOnMouseWheel();
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
        let CurrentDivIndex = this.CurrentDivIndex;
        let InstanceDivs = this.InstanceDivs;
        let InstanceDivLength = InstanceDivs.length;
        let MaxDivIndex = InstanceDivLength - 1;
        let MinDivIndex = 0;

        document.getElementById(ViewerElementID).onmousewheel = function(e)
        {
            if (e.deltaY > 0)
            {    
                if (CurrentDivIndex != MinDivIndex) 
                {
                    CurrentDivIndex--;

                    for (let i = 0; i < InstanceDivLength; i++)
                    {
                        document.getElementById(InstanceDivs[i].ID).style.display = "none";
                    }

                    document.getElementById(InstanceDivs[CurrentDivIndex].ID).style.display = "";
                }
            }
            else if (e.deltaY < 0)
            {
                if (CurrentDivIndex != MaxDivIndex) 
                {
                    CurrentDivIndex++;

                    for (let i = 0; i < InstanceDivLength; i++)
                    {
                        document.getElementById(InstanceDivs[i].ID).style.display = "none";
                    }

                    document.getElementById(InstanceDivs[CurrentDivIndex].ID).style.display = "";
                }
            }
        }
    }
}