
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
            
            //更新每個 Div 的偏移值
            let CurrentDivID = MyViewer.InstanceDivs[MyViewer.CurrentDivIndex].ID;
            let div = document.getElementById(CurrentDivID);
            let transformMartix = window.getComputedStyle(div).transform;
            let martixValue = transformMartix.match(/matrix.*\((.+)\)/)[1].split(",");
            let divTransformX = martixValue[4];
            let divTransformY = martixValue[5];
            MyViewer.InstanceDivs[MyViewer.CurrentDivIndex].divTransformX = divTransformX;
            MyViewer.InstanceDivs[MyViewer.CurrentDivIndex].divTransformY = divTransformY;
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
        
        MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].onmousewheel_Container_AbsOffsetX = e.offsetX; //滾輪觸發事件時，在容器內相差左上角的地方幾個像素點的X軸絕對值 onmousewheel_Container_AbsOffsetX
        MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex].onmousewheel_Container_AbsOffsetY = e.offsetY; //滾輪觸發事件時，在容器內相差左上角的地方幾個像素點的Y軸絕對值 onmousewheel_Container_AbsOffsetY
        
        if (e.deltaY > 0)
        {    
            if (MyViewer.CurrentDivIndex != MinDivIndex) 
            {
                keepSamePostion_Zoom_out();
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
                keepSamePostion_Zoom_in();
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



function keepSamePostion_Zoom_in()
{
    let nowInstanceDiv = MyViewer.InstanceDivs[MyViewer.CurrentDivIndex];
    let nextInstanceDiv = MyViewer.InstanceDivs[MyViewer.CurrentDivIndex + 1];
    
    let Xmagnification = nextInstanceDiv.Instance.MetaData.TotalPixelMatrixColumns / nowInstanceDiv.Instance.MetaData.TotalPixelMatrixColumns;
    let Ymagnification = nextInstanceDiv.Instance.MetaData.TotalPixelMatrixRows / nowInstanceDiv.Instance.MetaData.TotalPixelMatrixRows;

    let nowDivTransformX = nowInstanceDiv.divTransformX;
    let nowDivTransformY = nowInstanceDiv.divTransformY;

    let nextDivTransformX = nowDivTransformX * Xmagnification;
    let nextDivTransformY = nowDivTransformY * Ymagnification;

    //更新下一層的 MouseToolVariables offset X Y 數值 
    MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex + 1].offsetX = nextDivTransformX;
    MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex + 1].offsetY = nextDivTransformY;

    //更新下一層的 divTransform X Y 數值
    MyViewer.InstanceDivs[MyViewer.CurrentDivIndex + 1].divTransformX = nextDivTransformX;
    MyViewer.InstanceDivs[MyViewer.CurrentDivIndex + 1].divTransformY = nextDivTransformY;

    document.getElementById(nextInstanceDiv.ID).style.transform = "translate(" + nextDivTransformX +"px, " + nextDivTransformY + "px)";
    
}

function keepSamePostion_Zoom_out()
{
    let nowInstanceDiv = MyViewer.InstanceDivs[MyViewer.CurrentDivIndex];
    let lastInstanceDiv = MyViewer.InstanceDivs[MyViewer.CurrentDivIndex - 1];
    
    let Xmagnification = lastInstanceDiv.Instance.MetaData.TotalPixelMatrixColumns / nowInstanceDiv.Instance.MetaData.TotalPixelMatrixColumns;
    let Ymagnification = lastInstanceDiv.Instance.MetaData.TotalPixelMatrixRows / nowInstanceDiv.Instance.MetaData.TotalPixelMatrixRows;

    let nowDivTransformX = nowInstanceDiv.divTransformX;
    let nowDivTransformY = nowInstanceDiv.divTransformY;

    let nextDivTransformX = nowDivTransformX * Xmagnification;
    let nextDivTransformY = nowDivTransformY * Ymagnification;

    //更新上一層的 MouseToolVariables offset X Y 數值
    MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex - 1].offsetX = nextDivTransformX;
    MyViewer.MouseToolVariables[MyViewer.CurrentDivIndex - 1].offsetY = nextDivTransformY;

    //更新上一層的 divTransform X Y 數值
    MyViewer.InstanceDivs[MyViewer.CurrentDivIndex - 1].divTransformX = nextDivTransformX;
    MyViewer.InstanceDivs[MyViewer.CurrentDivIndex - 1].divTransformY = nextDivTransformY;

    document.getElementById(lastInstanceDiv.ID).style.transform = "translate(" + nextDivTransformX +"px, " + nextDivTransformY + "px)";
    
}