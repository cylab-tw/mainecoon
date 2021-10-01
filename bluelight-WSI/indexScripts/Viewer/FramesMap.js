class FramesMap
{
    constructor(FramesCount, WidthCountOfFrame, HeightCountOfFrame, FrameWidth, FrameHeight)
    {
        this.FramesCount = FramesCount;
        this.WidthCountOfFrame = WidthCountOfFrame;
        this.HeightCountOfFrame = HeightCountOfFrame;
        this.FrameWidth = FrameWidth;
        this.FrameHeight = FrameHeight;
    }

    getFramesMap()
    {
        let Startx = 0;
        let Starty = 0;
        let StartFrameID = 1;
        let result = [];

        for (let maxHeight = 0; maxHeight < this.HeightCountOfFrame; maxHeight++)
        {
            for (let maxWidth = 0; maxWidth < this.WidthCountOfFrame; maxWidth++)
            {
                let tempVariables = {"ID" : StartFrameID, "StartXpoint" : Startx, "StartYpoint" : Starty};
                result.push(DeepCopy(tempVariables));
                Startx = Startx + this.FrameWidth;
                StartFrameID++;
            }
            Startx = 0;
            Starty = Starty + this.FrameHeight;
        }
        return result;
    }


}