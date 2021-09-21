var isMouseDown = false;
let mouseX = 0;
let mouseY = 0;
let offsetX = 0;
let offsetY = 0;

function WSImove(e)
{
    console.log("你按後正在滑動滑鼠了");
    if (isMouseDown) 
    {
        const dx = e.pageX - mouseX
        const dy = e.pageY - mouseY
        console.log(MyViewer.CurrentDivIndex);
        let CurrentDivID = MyViewer.InstanceDivs[MyViewer.CurrentDivIndex].ID;
        document.getElementById(CurrentDivID).style.transform = `translate(${offsetX + dx}px,${offsetY + dy}px)`;
    }
}

function setViewerOnMouseUp()
{
    document.getElementById(ViewerElementID).onmouseup = function(e)
    {
        if (isMouseDown) 
        {
            offsetX += e.pageX - mouseX;
            offsetY += e.pageY - mouseY;
        }
        
        isMouseDown = false;
        document.getElementById(ViewerElementID).removeEventListener("mousemove", WSImove);
    }
}

function setViewerOnMouseDown()
{
    document.getElementById(ViewerElementID).onmousedown = function(e)
    {
        isMouseDown = true;
        mouseX = e.pageX;
        mouseY = e.pageY;
        console.log("你按下滑鼠了\n mouseX="+mouseX+"\nmouseY="+mouseY);
        document.getElementById(ViewerElementID).addEventListener('mousemove', WSImove);
    }
}

function setViewerOnMouseWheel()
{
    document.getElementById(ViewerElementID).onmousewheel = function(e)
    {
        let InstanceDivs = MyViewer.InstanceDivs;
        let InstanceDivLength = InstanceDivs.length;
        let MaxDivIndex = InstanceDivLength - 1;
        let MinDivIndex = 0;

        if (e.deltaY > 0)
        {    
            if (MyViewer.CurrentDivIndex != MinDivIndex) 
            {
                MyViewer.CurrentDivIndex--;

                for (let i = 0; i < InstanceDivLength; i++)
                {
                    document.getElementById(InstanceDivs[i].ID).style.display = "none";
                }

                document.getElementById(InstanceDivs[MyViewer.CurrentDivIndex].ID).style.display = "";
            }
        }
        else if (e.deltaY < 0)
        {
            if (MyViewer.CurrentDivIndex != MaxDivIndex) 
            {
                MyViewer.CurrentDivIndex++;

                for (let i = 0; i < InstanceDivLength; i++)
                {
                    document.getElementById(InstanceDivs[i].ID).style.display = "none";
                }

                document.getElementById(InstanceDivs[MyViewer.CurrentDivIndex].ID).style.display = "";
            }
        }
    }
}