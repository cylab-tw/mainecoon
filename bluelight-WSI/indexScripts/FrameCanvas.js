class FrameCanvas
{
    constructor(FatherElementID, ID, Frame)
    {
        this.FatherElementID = FatherElementID;
        this.ID = ID;
        this.Frame = Frame;
    }

    init()
    {
        this.Create();
    }

    Create()
    {
        let FatherElement = document.getElementById(this.FatherElementID);
        let element = document.createElement('CANVAS');
        element.id = this.ID;
        FatherElement.appendChild(element);
    }
}