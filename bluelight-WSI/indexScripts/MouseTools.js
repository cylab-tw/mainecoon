
function WSImove(e)
{
    if (MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].isMouseDown) 
    {
        const dx = e.pageX - MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].mouseX;
        const dy = e.pageY - MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].mouseY;
        let CurrentDivID = MyViewer.InstanceDivs[MyViewer.CurrentDivIndex].ID;
        document.getElementById(CurrentDivID).style.transform = "translate(" + (MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].offsetX + dx) + "px," + (MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].offsetY + dy) + "px)";        
    }
}

function setViewerOnMouseUp()
{
    document.getElementById(ViewerElementID).onmouseup = function(e)
    {
        if (MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].isMouseDown) 
        {
            MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].offsetX += e.pageX - MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].mouseX;
            MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].offsetY += e.pageY - MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].mouseY;
        }
        
        MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].isMouseDown = false;
        document.getElementById(ViewerElementID).removeEventListener("mousemove", WSImove);
    }
}

function setViewerOnMouseDown()
{
    document.getElementById(ViewerElementID).onmousedown = function(e)
    {
        MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].isMouseDown = true;
        MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].mouseX = e.pageX;
        MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].mouseY = e.pageY;
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