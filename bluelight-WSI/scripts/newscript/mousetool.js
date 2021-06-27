function setTransform2(viewportnum) {
    var div = getByid("div_deep_" + wsi_deep);
    if (!div) return;
    div.style.transform = "translate(" + Ipx(GetViewport().newMousePointX + parseInt(GetViewport().clientWidth / 2)) + "," + Ipx(GetViewport().newMousePointY + parseInt(GetViewport().clientHeight / 2)) + ")";
}

var WSIstate1 = false;

var wheel_date = 0;
var wheel_direction = 0;
function get_wheelDate_distance() {
    var date_now = new Date();
    date_now = date_now.getTime();
    return date_now - wheel_date;
}

function hideWSIDiv() {
    var sortSops = sortSopsFromSize();
    for (var deep = 0; deep < sortSops.length; deep++) {
        try {
            var div = getByid("div_deep_" + deep);
            if (deep == wsi_deep) {
                div.style.display = '';
            } else {
                div.style.display = 'none';
            }
        } catch (ex) { console.log(ex); }
    }
}

function mouseTool() {
    var num = 0;
    if (BL_mode == 'MouseTool') {
        Wheel = function (e) {
            if (WSIstate1 == true) return;
            WSIstate1 = true;
            var sortSops = sortSopsFromSize();
            if (e.deltaY < 0) {
                if (wsi_deep > 0) {
                    wsi_deep--;
                    //console.log(sortSops[wsi_deep].Xoffset)
                    var width = sortSops[wsi_deep].Frames[0].width;
                    var height = sortSops[wsi_deep].Frames[0].height;
                    var matrixColumns = sortSops[wsi_deep].matrixColumns;
                    var matrixRows = sortSops[wsi_deep].matrixRows;
                    console.log(sortSops[wsi_deep].Yoffset*Math.ceil(matrixRows / width));
                    console.log(sortSops[wsi_deep].Xoffset*Math.ceil(matrixColumns / height));
                    GetViewport().newMousePointX -= 512;
                    GetViewport().newMousePointY += 70;
                    GetViewport().newMousePointX *= 2;
                    GetViewport().newMousePointY *= 2;
                }

            }
            else if (e.deltaY > 0) {
                if (wsi_deep < sortSops.length - 1) {
                    wsi_deep++;
                    //console.log(sortSops);
                    var width = sortSops[wsi_deep].Frames[0].width;
                    var height = sortSops[wsi_deep].Frames[0].height;
                    var matrixColumns = sortSops[wsi_deep].matrixColumns;
                    var matrixRows = sortSops[wsi_deep].matrixRows;
                    console.log(sortSops[wsi_deep].Yoffset*Math.ceil(matrixRows / width));
                    console.log(sortSops[wsi_deep].Xoffset*Math.ceil(matrixColumns / height));
                    GetViewport().newMousePointX /= 2;
                    GetViewport().newMousePointY /= 2;
                    GetViewport().newMousePointX += 512;
                    GetViewport().newMousePointY -= 70;
                }
            }
            window.setTimeout(function () {
                WSIstate1 = false;
            }, 500);
            hideWSIDiv();
            setTransform2();
            loadImage2Canvas();
        }
        Mousedown = function (e) {
            if (e.which == 1) MouseDownCheck = true;
            //else if (e.which == 3) rightMouseDown = true;
            windowMouseX = GetmouseX(e);
            windowMouseY = GetmouseY(e);
            //GetViewport().originalPointX = getCurrPoint(e)[0];
            //GetViewport().originalPointY = getCurrPoint(e)[1];
        };
        Touchstart = function (e, e2) {
            e=e.touches[0];
            MouseDownCheck = true;
            //else if (e.which == 3) rightMouseDown = true;
            windowMouseX = GetmouseX(e);
            windowMouseY = GetmouseY(e);
           // console.log(windowMouseX);
            //GetViewport().originalPointX = getCurrPoint(e)[0];
            //  GetViewport().originalPointY = getCurrPoint(e)[1];
        }

        Touchmove = function (e, e2) {
            // var currX = getCurrPoint(e)[0];
            //var currY = getCurrPoint(e)[1];
            e=e.touches[0];
            if (MouseDownCheck) {
                var MouseX = GetmouseX(e);
                var MouseY = GetmouseY(e);
                // console.log(GetmouseX(e) ,windowMouseX);
                GetViewport().newMousePointX += MouseX - windowMouseX;
                GetViewport().newMousePointY += MouseY - windowMouseY;
                //setTransform();
                //console.log(windowMouseX);

            }
            setTransform2();

            //setTransform();
            //setWholeSlideTransform();
            windowMouseX = GetmouseX(e);
            windowMouseY = GetmouseY(e);
        }
        Mousemove = function (e) {
            //var currX = getCurrPoint(e)[0];
            ////var currY = getCurrPoint(e)[1];
            /*
            var labelXY = getClass('labelXY'); {
                let angel2point = rotateCalculation(e);
                labelXY[viewportNumber].innerText = "X: " + parseInt(angel2point[0]) + " Y: " + parseInt(angel2point[1]);
            }
            if (rightMouseDown == true) {
                scale_size(e, currX, currY)
            }
            if (openLink == true) {
                for (var i = 0; i < Viewport_Total; i++) {
                    GetViewport(i).newMousePointX = GetViewport().newMousePointX;
                    GetViewport(i).newMousePointY = GetViewport().newMousePointY;
                }
            }
            putLabel();*/
            // for (var i = 0; i < Viewport_Total; i++)
            //    displayRular(i);
            //console.log(111);
            if (MouseDownCheck) {
                var MouseX = GetmouseX(e);
                var MouseY = GetmouseY(e);
                // console.log(GetmouseX(e) ,windowMouseX);
                GetViewport().newMousePointX += MouseX - windowMouseX;
                GetViewport().newMousePointY += MouseY - windowMouseY;
                //setTransform();


            }
            setTransform2();

            //setTransform();
            //setWholeSlideTransform();
            windowMouseX = GetmouseX(e);
            windowMouseY = GetmouseY(e);
        }
        Touchend = function (e, e2) {
            //if (openMouseTool == true && rightMouseDown == true)
            //    displayMark(NowResize, null, null, null, viewportNumber);
            MouseDownCheck = false;
            rightMouseDown = false;
           // magnifierDiv.style.display = "none";
           // displayMeasureRular();
           // if (openLink) {
           //     for (var i = 0; i < Viewport_Total; i++)
           //         displayRular(i);
           // }
            setTransform2();
            loadImage2Canvas();
        }
        Mouseup = function (e) {
            var currX = getCurrPoint(e)[0];
            var currY = getCurrPoint(e)[1];
            if (openMouseTool == true && rightMouseDown == true)
                displayMark(NowResize, null, null, null, viewportNumber);
            MouseDownCheck = false;
            rightMouseDown = false;
            magnifierDiv.style.display = "none";
            displayMeasureRular();
            if (openLink) {
                for (var i = 0; i < Viewport_Total; i++)
                    displayRular(i);
            }
            setTransform2();
            loadImage2Canvas();
        }
        Mouseout = function (e) {

        }
    }
}