class InstanceDiv
{
    constructor(FatherElementID, ID, Instance)
    {   
        this.FatherElementID = FatherElementID;
        this.ID = ID;
        this.Instance = Instance;
    }

    init()
    {
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
        
    }
}