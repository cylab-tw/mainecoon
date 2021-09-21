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
        let img = new Image();
        element.id = this.ID;
        //element.width = this.Frame.width;
        //element.height = this.Frame.height;
        element.width = 50;
        element.height = 50;
        element.style.position = "absolute";
        element.style.transform = "translate(" + testx + "px" + "," + testy + "px" + ")";
        testx = testx + element.width;
        testy = testy + element.height;
        let ctx = element.getContext("2d");
        img.onload = function()
        {
            ctx.drawImage(img, 0, 0, element.width, element.height);
        }
        //img.src = this.Frame.Frame_URL;
        img.src = "https://cdn-icons-png.flaticon.com/512/104/104645.png";
        FatherElement.appendChild(element);
    }

    
}