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
        this.Create(this.ID);
    }

    Create(ID)
    {
        let FatherElement = document.getElementById(this.FatherElementID);
        let element = document.createElement('CANVAS');
        element.id = ID;
        element.width = this.Frame.width;
        element.height = this.Frame.height;
        element.style.position = "absolute";
        element.style.transform = "translate(" + this.Frame.FrameAddress.StartXpoint + "px" + "," + this.Frame.FrameAddress.StartYpoint + "px" + ")";
        let ctx = element.getContext("2d");
        let img = new Image();
        img.onload = function()
        {
            ctx.drawImage(img, 0, 0, element.width, element.height);
        }
        img.src = this.Frame.Frame_URL;
        FatherElement.appendChild(element);
    }
}