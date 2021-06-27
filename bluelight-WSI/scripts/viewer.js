//當視窗大小改變
window.onresize = function () {
    //設定左側面板的style
    getByid("LeftPicture").style = "display: flex;flex-direction: column;position: absolute;z-index: 9";
    if (parseInt(getByid("LeftPicture").offsetHeight) + 10 >= window.innerHeight - document.getElementsByClassName("container")[0].offsetTop - (bordersize * 2)) { //getByid("LeftPicture").style.height=""+(window.innerHeight- document.getElementsByClassName("container")[0].offsetTop- (bordersize * 2))+"px";
        getByid("LeftPicture").style = "overflow-y: scroll;display: flex;flex-direction: column;position: absolute;z-index: 9;height:" + (window.innerHeight - document.getElementsByClassName("container")[0].offsetTop - (bordersize * 2)) + "px;"
    }
    //刷新每個Viewport
    for (i = 0; i < Viewport_Total; i++) {
        try {
            var alt = GetViewport(i).alt;
            var uid = SearchUid2Json(alt);
            NowResize = true;
            GetViewport().NowCanvasSizeWidth = GetViewport().NowCanvasSizeHeight = null;
            loadAndViewImage(Patient.Study[uid.studyuid].Series[uid.sreiesuid].Sop[uid.sopuid].imageId, null, null, i);
        } catch (ex) { }
    }

    for (var tempSizeNum = 0; tempSizeNum < Viewport_Total; tempSizeNum++) {
        //如果VR及MPR開著，刷新VR的大小(MPR的右下角也有VR)
        if (openVR == true || openMPR == true) {
            for (var ll = 0; ll < o3DListLength; ll++) {
                var div1 = getByid("3DDiv" + ll);
                var WandH = 0;
                if (openVR) WandH = getViewportFixSize(window.innerWidth, window.innerHeight, 1, 1);
                else if (openMPR) WandH = getViewportFixSize(window.innerWidth, window.innerHeight, 2, 2);
                div1.style.width = WandH[0] + "px";
                div1.style.height = WandH[1] + "px";
            }
            for (var ll = 0; ll < o3d_3degree; ll++) {
                var div2 = getByid("3DDiv2_" + ll);
                var WandH = 0;
                if (openVR) WandH = getViewportFixSize(window.innerWidth, window.innerHeight, 1, 1);
                else if (openMPR) WandH = getViewportFixSize(window.innerWidth, window.innerHeight, 2, 2);
                div2.style.width = WandH[0] + "px";
                div2.style.height = WandH[1] + "px";

                var div3 = getByid("3DDiv3_" + ll);
                div3.style.width = WandH[0] + "px";
                div3.style.height = WandH[1] + "px";
            }
            if (tempSizeNum != viewportNumber) continue;
        }
        //需要再做更正--*
        try {
            MainCanvasT = GetViewport(tempSizeNum).canvas();
            MarkCanvasT = GetViewport(tempSizeNum);
            var HandWT = getStretchSize(GetViewport(tempSizeNum).imageWidth, GetViewport(tempSizeNum).imageHeight, GetViewport(tempSizeNum));
            MainCanvasT.style = "width:" + HandWT[0] + "px;height:" + HandWT[1] + "px;display:block;position:absolute;top:50%;left:50%";
            MainCanvasT.style.margin = "-" + (HandWT[0] / 2) + "px 0 0 -" + (HandWT[1] / 2) + "px";
            GetViewport(tempSizeNum).newMousePointX = 0;
            GetViewport(tempSizeNum).newMousePointY = 0;
            // NowCanvasSizeHeight = 0;
            // NowCanvasSizeWidth = 0;
            Css(MainCanvasT, 'transform', "translate(" + ToPx(GetViewport(tempSizeNum).newMousePointX) + "," + ToPx(GetViewport(tempSizeNum).newMousePointY) + ")rotate(" + GetViewport().rotateValue + "deg)");
            Css(MarkCanvasT, 'transform', "translate(" + ToPx(GetViewport(tempSizeNum).newMousePointX) + "," + ToPx(GetViewport(tempSizeNum).newMousePointY) + ")rotate(" + GetViewport().rotateValue + "deg)");
            MarkCanvasT.width = MainCanvasT.width;
            MarkCanvasT.height = MainCanvasT.height;
        } catch (ex) { }
    }
    //暫時移除的功能
    /*if (openPenDraw == true) {
        var WandH = getFixSize(window.innerWidth, window.innerHeight, GetViewport(0));
        GetViewport(0).style = "position:relative;float: top;left:100px;width:calc(100% - " + (100 + (bordersize * 2)) + "px);" + "height:" + (WandH[1] - (bordersize * 2)) + "px;overflow:hidden;border:" + bordersize + "px #D3D9FF groove;margin:0px";
    }*/
    try { //需要再做更正--*
        var height = window.innerHeight;
        while (height > window.innerHeight - document.getElementsByClassName("container")[0].offsetTop - (bordersize * 2) && height >= 10) height -= 5;
        getByid("cornerstonePenCanvas").getElementsByClassName("CornerstoneViewport")[0]
            .getElementsByClassName("viewport-element")[0].getElementsByClassName("cornerstone-canvas")[0].
            style.height = "" + height + "px";
    } catch (ex) { }
    EnterRWD();
}

//執行icon圖示的摺疊效果
function EnterRWD() {
    //if (openPenDraw == true) return;
    //計算目前有幾個應被計算的icon在上方
    var count = 1;
    //計算上方icon的區塊有多少空間可以容納
    var iconWidth = getClass("page-header")[0].offsetWidth; //window.innerWidth;
    //檢查icon區塊的寬度是否足夠
    var check = false;
    for (let i = 0; i < getClass("page-header")[0].childNodes.length; i++) {
        if (getClass("page-header")[0].childNodes[i].tagName == "IMG") count++;
        if (getClass("page-header")[0].childNodes[i].alt == "輸出標記") continue;
        if (getClass("page-header")[0].childNodes[i].alt == "3dDisplay") continue;
        if (getClass("page-header")[0].childNodes[i].alt == "3dCave") continue;
        if (getClass("page-header")[0].childNodes[i].tagName == "IMG")
            if (count * 50 >= iconWidth - 50 - 30) {
                if (openRWD == true) { //如果折疊功能開啟中，隱藏應被隱藏的icon
                    getClass("page-header")[0].childNodes[i].style.display = "none";
                } else {
                    getClass("page-header")[0].childNodes[i].style.display = "";
                }
                //寬度足夠
                check = true;
            } else { //全部icon均顯示
                getClass("page-header")[0].childNodes[i].style.display = "";
            }
    }
    //如果寬度足夠而沒有觸發折疊，摺疊的icon應該不顯示
    if (check == true) getByid("rwdImgTag").style.display = "";
    else getByid("rwdImgTag").style.display = "none";
    //刷新Viewport窗格
    SetTable();
}

function virtualLoadImage(imageId, left) {
    //left==1代表為該series首張影像，為零代表非首張影像，為-1代表為使用local端載入
    try {
        cornerstone.loadAndCacheImage(imageId, {
            usePDFJS: true
        }).then(function (image) {
            //StudyUID:x0020000d,Series UID:x0020000e,SOP UID:x00080018,
            //Instance Number:x00200013,影像檔編碼資料:imageId,PatientId:x00100020
            var Hierarchy = loadUID(image.data.string('x0020000d'), image.data.string('x0020000e'), image.data.string('x00080018'), image.data.string('x00200013'), imageId, image.data.string('x00100020'));
            NowAlt = image.data.string('x0020000e');
            DisplaySeriesCount(null);
            //如果為使用local端開啟並且為初次載入，顯示影像
            if (left != -1 && (Hierarchy == 0 || Hierarchy == 1)) left = 1;
            //如果為首張，顯示影像
            if (left == 1) {
                var newView = SetToLeft(image.data.string('x0020000e'), undefined, image.data.string('x00100020'));
                showTheImage(newView, image, 'leftCanvas');
                loadAndViewImage(imageId);
            }
            return image.data.string('x0020000e');
        }, function (err) { });
    } catch (err) { }
}

function displayWsiImage2(deep, instance_rows, instance_columns) {
    try {
        function getFrame(Sop, frame) {
            for (var f = 0; f < Sop.FrameAmount; f++) {
                if (Sop.Frames[f].Frame == frame) return Sop.Frames[f];
            }
        }
        var sortSops = sortSopsFromSize();
        // console.log(sortSops, wsi_Response.length);
        //if (sortSops.length < wsi_Response.length - 1) return;
        var SopObject = sortSops[deep];//Patient.Study[0].Series[0].Sop[0];

        var width = SopObject.Frames[0].width;
        var height = SopObject.Frames[0].height;
        var matrixColumns = SopObject.matrixColumns;
        var matrixRows = SopObject.matrixRows;
        var FramwsArray = getWSIArray(Math.ceil(matrixColumns / height), Math.ceil(matrixRows / width));
        // console.log(FramwsArray, instance_rows, instance_columns);
        var FrameObj = getFrame(SopObject, FramwsArray[instance_rows][instance_columns]);
        //flag3
        //wadorsLoader(url, response, type, frame, instance_url);
        // console.log(FrameObj);
        if (FrameObj != undefined && getByid(deep + "_y" + instance_rows + "_x" + instance_columns).load != true) {
            getByid(deep + "_y" + instance_rows + "_x" + instance_columns).load = true;
            //console.log('a', instance_rows, instance_columns);
            let img = new Image;
            img.onload = function () {
                try {
                    var canvas = getByid(deep + "_y" + instance_rows + "_x" + instance_columns);
                    canvas.style.display = "";
                    canvas.width = width;
                    canvas.height = height;
                    var ctx = canvas.getContext("2d");
                    var offsetX = ((sortSopsFromSize()[deep].FramwsArray[0].length / 2) - instance_columns) * height;
                    var offsetY = ((sortSopsFromSize()[deep].FramwsArray.length / 2) - instance_rows) * width;
                    //console.log((sortSopsFromSize()[deep].FramwsArray.length / 2), instance_rows);
                    canvas.style.position = "absolute";
                    canvas.style.transform = "translate(" + Fpx(0 - offsetX) + "," + Fpx(0 - offsetY) + ")";
                    ctx.drawImage(img, 0, 0, parseInt(width - 0), parseInt(height - 0)); // Or at whatever offset you like
                } catch (ex) {
                    console.log(ex);
                    return;
                }
            };
            //FrameObj.imgObj = img;
            img.src = FrameObj.dataURL;
            //console.log(FrameObj.dataURL);
        }
    } catch (ex) { console.log(ex); }
}

var wsi_global_width = 0;

var wsi_global_height = 0;
var wsi_response2;
var wsi_xy = [0, 0];
var wsi_size = 2;
var wsi_instance_url = "";
var wsi_deep = 0;
var loadingWSI = 0;
function WSI_Loader(url, sops_count) {
    img2darkByClass("WSI", !openWSI);
    // console.log(url);
    let wsi_req = new XMLHttpRequest();
    wsi_req.open('GET', url + "/metadata");
    //console.log(url + "/metadata")
    // return;
    wsi_req.responseType = 'json';
    //發送以Series為單位的請求

    wsi_req.onload = function () {
        let wsi_Response = wsi_req.response;
        for (var w = 0; w < wsi_Response.length; w++) {
            let wsi_instance_req = new XMLHttpRequest();
            //const instance_temp = wsi_Response[w]["00080018"].Value[0];
            let instance_url = url + "/instances/" + wsi_Response[w]["00080018"].Value[0];
            wsi_instance_url = instance_url;
            wsi_instance_req.open('GET', instance_url/* + "/frames/" + (f + 1)*/ + "/metadata");
            wsi_instance_req.responseType = 'json';
            wsi_instance_req.onload = function () {
                //if (!wsi_response2) { } else { return };
                let wsi_instance_Response = wsi_instance_req.response;
                wsi_response2 = wsi_instance_Response;
                var width = wsi_instance_Response[0]['00280010'].Value[0];
                var height = wsi_instance_Response[0]['00280011'].Value[0];
                var matrixColumns = wsi_instance_Response[0]['00480006'].Value[0];
                var matrixRows = wsi_instance_Response[0]['00480007'].Value[0];
                var FramwsArray = getWSIArray(Math.ceil(matrixColumns / height), Math.ceil(matrixRows / width));
                // console.log(instance_url);
                // console.log(matrixColumns, width, matrixRows, height, FramwsArray);
                var tmp_wsi_size = 0;
                //flag1

                //if (parseInt(matrixColumns / width) <= 10 || parseInt(matrixRows / height) <= 10) return;

                for (var i = 0; i < Math.ceil(matrixRows / width); i++) {
                    for (var i2 = 0; i2 < Math.ceil(matrixColumns / height); i2++) {
                        //console.log(parseInt(FramwsArray[i][i2]));
                        try {
                            if (!FramwsArray || !FramwsArray[i] || isNaN(Math.ceil(FramwsArray[i][i2]))) {
                                LoadError++; continue
                            };
                            //flag2
                            wadorsLoader(instance_url + "/frames/" + parseInt(FramwsArray[i][i2]) + "/rendered", wsi_instance_Response, "WSI", parseInt(FramwsArray[i][i2]), instance_url);
                            //console.log( parseInt(FramwsArray[i][i2]));
                        } catch (ex) { console.log(ex); };
                    }
                }

                //console.log(Math.ceil(matrixColumns / height));
                //for (var i = 0; i < Viewport_Total; i++) {
                //clearInterval(PlayTimer1[i]);
                // }
                // var fps = parseInt((1 / parseFloat(getByid("textPlay").value) * 1000));
                function getFrame(Sop, frame) {
                    for (var f = 0; f < Sop.FrameAmount; f++) {
                        if (Sop.Frames[f].Frame == frame) return Sop.Frames[f];
                    }
                }

                var timer = setInterval(function () {
                    var sortSops = sortSopsFromSize();
                    //loadingWSI = 12;
                    if (sortSops.length < wsi_Response.length - LoadError - 1) return;

                    clearInterval(this);
                    clearInterval(timer);
                    delete timer;
                    if (loadingWSI == "startloading" || loadingWSI == "endloading") return;
                    loadingWSI = "startloading";
                    for (var deep = 0; deep < sortSops.length; deep++) {
                        //console.log(deep);
                        var element = document.createElement('DIV');//getByid("tempWsiDicomImage");
                        element.id = "div_deep_" + deep;//sortSopsFromSize()[deep].SopUID;

                        var instance_rows = sortSopsFromSize()[deep].FramwsArray.length;
                        var instance_columns = sortSopsFromSize()[deep].FramwsArray[0].length;
                        for (var y = 0; y < instance_rows + 1; y++) {
                            for (var x = 0; x < instance_columns + 1; x++) {
                                var canvas_tmp = document.createElement("CANVAS");
                                canvas_tmp.id = deep + "_y" + y + "_x" + x;
                                canvas_tmp.style.display = "none";
                                //canvas_tmp.style.width = (256 * drawHeight) + "px";
                                //canvas_tmp.style.height=(256 * drawWidth) + "px";
                                element.appendChild(canvas_tmp);
                            }
                        }
                        GetViewport().appendChild(element);
                    }
                    loadingWSI = "endloading";

                    clearInterval(this);
                    clearInterval(timer);
                    delete timer;
                    loadImage2Canvas();
                    //displayWsiImage2(0, sortSopsFromSize()[0].FramwsArray.length / 2, sortSopsFromSize()[0].FramwsArray[0].length / 2);
                    //displayWsiImage2(0, sortSopsFromSize()[0].FramwsArray.length / 2 + 1, sortSopsFromSize()[0].FramwsArray[0].length / 2);
                    return;

                }, 500);


            }
            wsi_instance_req.send();

        }
        return;

    }
    wsi_req.send();
    //"00280008"
}

function loadImage2Canvas() {
    //wsi_deep=1;
    var sortSops = sortSopsFromSize();
    // console.log(sortSops, wsi_Response.length);
    //if (sortSops.length < wsi_Response.length - 1) return;
    var SopObject = sortSops[wsi_deep];//Patient.Study[0].Series[0].Sop[0];

    var width = SopObject.Frames[0].width;
    var height = SopObject.Frames[0].height;
    var matrixColumns = SopObject.matrixColumns;
    var matrixRows = SopObject.matrixRows;
    var helfY = (sortSopsFromSize()[wsi_deep].FramwsArray.length / 2) * height;
    var helfX = (sortSopsFromSize()[wsi_deep].FramwsArray[0].length / 2) * width;
    //GetViewport().newMousePointX=offsetX;
    // GetViewport().newMousePointY=offsetY;
    //console.log((helfX-GetViewport().newMousePointX)/height);
    //console.log(sortSopsFromSize()[wsi_deep].FramwsArray.length / 2);
    //console.log(offsetX,offsetY);
    //GetViewport().newMousePointX;
    //GetViewport().newMousePointY;
    var instance_rows = parseInt((helfY - GetViewport().newMousePointY ) / height);
    var instance_columns = parseInt((helfX - GetViewport().newMousePointX ) / width);
    /*
     var instance_rows = parseInt((helfY - GetViewport().newMousePointY + parseInt(GetViewport().clientHeight / 2)) / height);
    var instance_columns = parseInt((helfX - GetViewport().newMousePointX + parseInt(GetViewport().clientWidth / 2)) / width);
    */
    //console.log(instance_columns, instance_rows);
    for (var i = -1; i <= 1; i++) {
        for (var i2 = -1; i2 <= 1; i2++) {
            try {
                if (getByid(wsi_deep + "_y" + (instance_rows + i) + "_x" + (instance_columns + i2)).load != true) {
                    displayWsiImage2(wsi_deep, (instance_rows + i), (instance_columns + i2));
                    // console.log(instance_rows + i, instance_columns + i2);
                }
            } catch (ex) { /*console.log(ex, instance_rows + i, instance_columns + i2);*/ };
        }
    }
}

var loadWSI_first = false;
var LoadError = 0;

function loadFirstWSI() {
    if (loadWSI_first == false) {
        loadWSI_first = true;
        loadWSIWholeSlide();
        loadNewWSI();
    }
}
function wadorsLoader(url, response, type, frame, instance_url) {
    var data = [];
    if (loadingWSI == 10) {
        console.log(loadingWSI);
        //return;
    }
    //console.log(loadingWSI);
    // console.log(loadingWSI);
    // console.log(url);
    function getValue(obj) {
        try {
            return obj.Value[0];
        } catch (ex) {
            return undefined;
        }
        return undefined;
    }
    var dataURL = url;//getDataUrl(img);
    var wsi = {};
    wsi.study = getValue(response[0]['0020000D']);
    wsi.series = getValue(response[0]['0020000E']);
    wsi.sop = getValue(response[0]['00080018']);
    wsi.instance = getValue(response[0]['00200013']);
    wsi.imageId = url;
    wsi.patientId = getValue(response[0]['00100020']);
    wsi.x = getValue(response[0]['00280006']);
    wsi.y = getValue(response[0]['00280008']);
    wsi.width = getValue(response[0]['00280010']);
    wsi.height = getValue(response[0]['00280011']);
    wsi.matrixColumns = getValue(response[0]['00480006']);
    wsi.matrixRows = getValue(response[0]['00480007']);
    // console.log(getValue(response[0]['00289110']));
    // console.log(getValue(response[0]['52009229']));
    // console.log(getValue(response[0]['52009229'])['00289110']);
    // console.log(getValue(getValue(getValue(response[0]['52009229'])['00289110'])['00180050']));//Slice Thickness
    // console.log(getValue(getValue(getValue(response[0]['52009229'])['00289110'])['00180088']));//Spacing Between Slices
    //console.log(getValue(getValue(getValue(response[0]['52009229'])['00289110'])['00280030']));//Pixel Spacing
    //console.log(getValue(getValue(response[0]['00480008'])['0040072A']));//X Offset in Slide Coordinate System 
    //console.log(getValue(getValue(response[0]['00480008'])['0040073A']));//Y Offset in Slide Coordinate System 
    wsi.Xoffset = getValue(getValue(response[0]['00480008'])['0040072A']);
    wsi.Yoffset = getValue(getValue(response[0]['00480008'])['0040073A']);
    // console.log(12355);
    //if (wsi.width >= wsi.matrixRows) wsi.matrixRows = wsi.width;
    //if (wsi.height >= wsi.matrixColumns) wsi.matrixColumns = wsi.height;
    wsi.instance_url = instance_url;

    var FramwsArray = getWSIArray(Math.ceil(wsi.matrixColumns / wsi.height), Math.ceil(wsi.matrixRows / wsi.width));
    wsi.rect = [getPointFromWSIArray(FramwsArray, frame)[0] * wsi.width, getPointFromWSIArray(FramwsArray, frame)[1] * wsi.height, wsi.width, wsi.height];
    wsi.frame = frame;
    wsi.dataURL = dataURL;
    wsi.response = response;
    loadUID_WSI(wsi);
    loadingWSI = 0;

    //loadWSI2jpeg_2(url, response, frame, instance_url);
    return;
    function getData() {
        fetch(url, {
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example'//,
                // 'content-type': 'multipart/related; type=application/dicom;'

            },
        })
            .then(async function (res) {
                let resBlob = await res.arrayBuffer();
                let intArray = new Uint8Array(resBlob);
                var string = '';
                for (let i = 0; i < intArray.length; i++) {
                    //console.log(resBlob[i]);
                    string += String.fromCodePoint(intArray[i]);
                }

                //console.log(bops.to(resBlob, encoding="binary"))
                //let item = await resBlob.text();
                var url = await stowMultipartRelated(string);
                //   console.log(url);
                if (ConfigLog.WADO.FileType == "JPEG" && type == "WSI") loadWSI2jpeg_2(url, response, frame, instance_url);
                // if (ConfigLog.WADO.FileType == "JPEG" && type == "WSI") loadAndViejpeg(url, undefined, undefined, undefined, response, frame);
                // else if (ConfigLog.WADO.FileType == "JPEG") loadAndViejpeg(url, undefined, undefined, undefined);
                //else loadAndViewImage("wadors:" + url);
            })
            .catch(function (err) {
                console.log(err);
            })
    }
    async function stowMultipartRelated(iData) {
        //console.log(iData);

        //req.body= req.body.toString('binary');
        let multipartMessage = iData;
        //let boundary = req.headers["content-type"].split("boundary=")[1];
        let startBoundary = multipartMessage.split("\r\n")[0];
        //let startBoundary = `--${boundary}`;
        let matches = multipartMessage.matchAll(new RegExp(startBoundary, "gi"));
        let fileEndIndex = [];
        let fileStartIndex = [];
        for (let match of matches) {
            fileEndIndex.push(match.index - 2);
        }
        fileEndIndex = fileEndIndex.slice(1);
        let data = multipartMessage.split("\r\n");
        let filename = [];
        let files = [];
        let contentDispositionList = [];
        let contentTypeList = [];
        for (let i in data) {
            let text = data[i];
            if (text.includes("Content-Disposition")) {
                contentDispositionList.push(text);
                let textSplitFileName = text.split("filename=")
                filename.push(textSplitFileName[textSplitFileName.length - 1].replace(/"/gm, ""));
            } else if (text.includes("Content-Type")) {
                contentTypeList.push(text);
            }
        }
        contentDispositionList = _.uniq(contentDispositionList);
        contentTypeList = _.uniq(contentTypeList);
        let teststring = ["Content-Type", "Content-Length", "MIME-Version"]
        let matchesIndex = []
        for (let type of teststring) {
            let contentTypeMatches = multipartMessage.matchAll(new RegExp(`${type}.*[\r\n|\r|\n]$`, "gim"));
            for (let match of contentTypeMatches) {
                matchesIndex.push({
                    index: match.index,
                    length: match['0'].length
                })
            }
            // //+4
        }
        let maxIndex = _.maxBy(matchesIndex, "index");
        fileStartIndex.push(maxIndex.index + maxIndex.length + 3);
        //console.log(fileStartIndex);
        for (let i in fileEndIndex) {
            let fileData = multipartMessage.substring(fileStartIndex[i], fileEndIndex[i]);
            //console.log(fileData);
            files.push(fileData);
        }
        //console.log("Upload Files complete");
        function str2ab(str) {
            var buf = new ArrayBuffer(str.length); // 2 bytes for each char
            var bufView = new Uint8Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }
        let buf = str2ab(files[0]);
        //console.log(buf);
        var a = document.createElement("a"),
            url = URL.createObjectURL(new Blob([buf], { type: "image/jpeg" }));
        return url;
        /*
        a.href = url;
        a.download = "test";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);

        return { files: files, filename: filename };*/
    }
    return getData();
}

function loadWSI2jpeg_2(imageId, response, frame, instance_url) {
    //console.log(frame,instance_url);
    function getValue(obj) {
        try {
            return obj.Value[0];
        } catch (ex) {
            return undefined;
        }
        return undefined;
    }
    var dataURL = imageId;//getDataUrl(img);
    var wsi = {};
    wsi.study = getValue(response[0]['0020000D']);
    wsi.series = getValue(response[0]['0020000E']);
    wsi.sop = getValue(response[0]['00080018']);
    wsi.instance = getValue(response[0]['00200013']);
    wsi.imageId = imageId;
    wsi.patientId = getValue(response[0]['00100020']);
    wsi.x = getValue(response[0]['00280006']);
    wsi.y = getValue(response[0]['00280008']);
    wsi.width = getValue(response[0]['00280010']);
    wsi.height = getValue(response[0]['00280011']);
    wsi.matrixColumns = getValue(response[0]['00480006']);
    wsi.matrixRows = getValue(response[0]['00480007']);
    // console.log(getValue(response[0]['00289110']));
    // console.log(getValue(response[0]['52009229']));
    // console.log(getValue(response[0]['52009229'])['00289110']);
    // console.log(getValue(getValue(getValue(response[0]['52009229'])['00289110'])['00180050']));//Slice Thickness
    // console.log(getValue(getValue(getValue(response[0]['52009229'])['00289110'])['00180088']));//Spacing Between Slices
    //console.log(getValue(getValue(getValue(response[0]['52009229'])['00289110'])['00280030']));//Pixel Spacing
    //console.log(getValue(getValue(response[0]['00480008'])['0040072A']));//X Offset in Slide Coordinate System 
    // console.log(getValue(getValue(response[0]['00480008'])['0040073A']));//Y Offset in Slide Coordinate System 
    wsi.Xoffset = getValue(getValue(response[0]['00480008'])['0040072A']);
    wsi.Yoffset = getValue(getValue(response[0]['00480008'])['0040073A']);
    // console.log(12355);
    //if (wsi.width >= wsi.matrixRows) wsi.matrixRows = wsi.width;
    //if (wsi.height >= wsi.matrixColumns) wsi.matrixColumns = wsi.height;
    wsi.instance_url = instance_url;

    var FramwsArray = getWSIArray(Math.ceil(wsi.matrixColumns / wsi.height), Math.ceil(wsi.matrixRows / wsi.width));
    wsi.rect = [getPointFromWSIArray(FramwsArray, frame)[0] * wsi.width, getPointFromWSIArray(FramwsArray, frame)[1] * wsi.height, wsi.width, wsi.height];
    wsi.frame = frame;
    wsi.dataURL = dataURL;
    wsi.response = response;
    loadUID_WSI(wsi);
    loadingWSI = 0;
}

function initNewCanvas(newCanvas) {
    //初始化Canvas，添加事件
    canvas = newCanvas;
    ctx = canvas.getContext("2d");
    var viewportNumber2 = (viewportNumber + 1);
    if (viewportNumber2 > 3) viewportNumber2 = 0
    for (var i = 0; i < Viewport_Total; i++) {
        GetViewport(i).removeEventListener("contextmenu", contextmenuF, false);
        GetViewport(i).removeEventListener("mousemove", mousemoveF, false);
        GetViewport(i).removeEventListener("mousedown", mousedownF, false);
        GetViewport(i).removeEventListener("mouseup", mouseupF, false);
        GetViewport(i).removeEventListener("mouseout", mouseoutF, false);
        GetViewport(i).removeEventListener("wheel", wheelF, false);
        GetViewport(i).removeEventListener("mousedown", thisF, false);
        GetViewport(i).removeEventListener("touchstart", touchstartF, false);
        GetViewport(i).removeEventListener("touchend", touchendF, false);
        GetViewport(i).addEventListener("touchstart", thisF, false);
        GetViewport(i).addEventListener("mousedown", thisF, false);
        GetViewport(i).addEventListener("wheel", wheelF, false);
    }
    GetViewport().removeEventListener("touchstart", thisF, false);
    GetViewport().removeEventListener("mousedown", thisF, false);
    GetViewport().addEventListener("contextmenu", contextmenuF, false);
    GetViewport().addEventListener("mousemove", mousemoveF, false);
    GetViewport().addEventListener("mousedown", mousedownF, false);
    GetViewport().addEventListener("mouseup", mouseupF, false);
    GetViewport().addEventListener("mouseout", mouseoutF, false);
    GetViewport().addEventListener("touchstart", touchstartF, false);
    GetViewport().addEventListener("touchmove", touchmoveF, false);
    GetViewport().addEventListener("touchend", touchendF, false);
    //GetViewport((viewportNumber )).addEventListener("wheel", wheelF, false); --*
}


//渲染圖片到Viewport的函數
function showTheImage(element, image, mode, ifNowAlt, viewportNum0) {
    //-30是代表3D VR的顯示模式
    if (mode == '3d') {
        cornerstone.enable(element);
        const viewport1 = cornerstone.getDefaultViewportForImage(element, image);
        viewport1.voi.windowWidth = GetViewport().windowWidthList;
        viewport1.voi.windowCenter = GetViewport().windowCenterList;
        //如果是骨骼模型，使用對應的Window Level
        if (getByid("o3DAngio").selected == true) {
            viewport1.voi.windowWidth = 332;
            viewport1.voi.windowCenter = 287;
        } else if (getByid("o3DAirways").selected == true) {
            //如果是肺氣管模型，使用對應的Window Level
            viewport1.voi.windowWidth = 409;
            viewport1.voi.windowCenter = -538;
        }
        if (element.openInvert == true) viewport1.invert = !viewport1.invert;
        cornerstone.setViewport(element, viewport1);
        cornerstone.displayImage(element, image, viewport1);
        return;
    }
    var viewportNum;
    if (viewportNum0 >= 0) viewportNum = viewportNum0;
    else viewportNum = viewportNumber;
    //使用WebGL渲染，但目前尚未加入程式 --*
    const options = {
        renderer: 'webgl'
    };
    cornerstone.enable(element);
    const viewport = cornerstone.getDefaultViewportForImage(element, image);
    if (mode == 'normal' || mode == 'windowLevel' || mode == 'origin' || WindowOpen == true) {
        if (mode == 'origin') {
            if (GetViewport().windowWidthList && GetViewport().windowCenterList) {
                viewport.voi.windowWidth = GetViewport().windowWidthList;
                viewport.voi.windowCenter = GetViewport().windowCenterList;
            }
            if (GetViewport(viewportNum).openInvert == true) viewport.invert = !viewport.invert;
            cornerstone.setViewport(element, viewport);
        } else if (mode == 'windowLevel' || (WindowOpen == true && (ifNowAlt == true && element.windowWidthList != 0))) {
            viewport.voi.windowWidth = element.windowWidthList;
            viewport.voi.windowCenter = element.windowCenterList;
            cornerstone.setViewport(element, viewport);
        }
    }
    if (GetViewport(viewportNum).openHorizontalFlip == true) viewport.hflip = !viewport.hflip;
    if (GetViewport(viewportNum).openVerticalFlip == true) viewport.vflip = !viewport.vflip;
    if (element.openInvert == true) viewport.invert = !viewport.invert;
    cornerstone.displayImage(element, image, viewport);
}

//按下滑鼠或觸控要做的事情 --*
function DivDraw(e) {
    //if (MouseDownCheck == false) getByid("MeasureLabel").style.display = "none";
    if (openZoom == false && openMeasure == false && MouseDownCheck == false && openAngel == 0) return;
    //magnifierDiv.style.display="none";
    // x_out = -magnifierWidth / 2; // 與游標座標之水平距離
    // y_out = -magnifierHeight / 2; // 與游標座標之垂直距離
    x_out = -parseInt(magnifierCanvas.style.width) / 2; // 與游標座標之水平距離
    y_out = -parseInt(magnifierCanvas.style.height) / 2; // 與游標座標之垂直距離

    if (openMeasure && (MouseDownCheck == true || TouchDownCheck == true)) {
        getByid("MeasureLabel").style.display = '';
        if (MeasureXY2[0] > MeasureXY[0])
            x_out = 20; // 與游標座標之水平距離
        else x_out = -20;
        if (MeasureXY2[1] > MeasureXY[1])
            y_out = 20; // 與游標座標之水平距離
        else y_out = -20;
    }
    if (openAngel >= 2) {
        getByid("AngelLabel").style.display = '';
        if (AngelXY2[0] > AngelXY0[0])
            x_out = 20; // 與游標座標之水平距離
        else x_out = -20;
        if (AngelXY2[1] > AngelXY0[1])
            y_out = 20; // 與游標座標之水平距離
        else y_out = -20;
    } else {
        getByid("AngelLabel").style.display = 'none';
    }

    if (document.body.scrollTop && document.body.scrollTop != 0) {
        dbst = document.body.scrollTop;
        dbsl = document.body.scrollLeft;
    } else {
        dbst = document.getElementsByTagName("html")[0].scrollTop;
        dbsl = document.getElementsByTagName("html")[0].scrollLeft;
    }
    if (openZoom)
        dgs = document.getElementById("magnifierDiv").style;
    else if (openMeasure)
        dgs = document.getElementById("MeasureLabel").style;
    else /* if (openAngel==2)*/
        dgs = document.getElementById("AngelLabel").style;
    y = e.clientY;
    x = e.clientX;
    if (!y || !x) {
        y = e.touches[0].clientY;
        x = e.touches[0].clientX;
    }
    if (MouseDownCheck == true || TouchDownCheck == true || openAngel == 2) {
        dgs.top = y + dbst + y_out + "px";
        dgs.left = x + dbsl + x_out + "px";
    }
    if (openMeasure) {
        getByid("MeasureLabel").innerText = parseInt(Math.sqrt(
            Math.pow(MeasureXY2[0] / GetViewport().PixelSpacingX - MeasureXY[0] / GetViewport().PixelSpacingX, 2) +
            Math.pow(MeasureXY2[1] / GetViewport().PixelSpacingY - MeasureXY[1] / GetViewport().PixelSpacingY, 2), 2)) +
            "mm";
    } else if (openAngel == 2) {
        var getAngle = ({
            x: x1,
            y: y1
        }, {
            x: x2,
            y: y2
        }) => {
            const dot = x1 * x2 + y1 * y2
            const det = x1 * y2 - y1 * x2
            const angle = Math.atan2(det, dot) / Math.PI * 180
            return (angle + 360) % 360
        }
        var angle = getAngle({
            x: AngelXY0[0] - AngelXY2[0],
            y: AngelXY0[1] - AngelXY2[1],
        }, {
            x: AngelXY0[0] - AngelXY1[0],
            y: AngelXY0[1] - AngelXY1[1],
        });
        if (angle > 180) angle = 360 - angle;
        getByid("AngelLabel").innerText = parseInt(angle) + "°";
    }
    if (parseInt(getByid("MeasureLabel").innerText) <= 1) getByid("MeasureLabel").style.display = "none";
}

function SetTable(row0, col0) {
    //取得Viewport的row與col數量
    let row = Viewport_row,
        col = Viewport_col;
    //如果有傳入row與col的參數，則優先使用傳入的
    if (row0 && col0) {
        row = row0;
        col = col0
    }
    //如果MPR模式正在開啟，固定2x2
    if (openMPR) {
        row = 2, col = 2;
    };
    //如果VR模式正在開啟，固定1x1
    if (openVR) {
        row = 1, col = 1;
    };
    //重置各個Viewport的長寬大小(有顯示時)
    try {
        var WandH = getViewportFixSize(window.innerWidth, window.innerHeight, row, col);
        for (var i = 0; i < Viewport_Total; i++)
            GetViewport(i).style = "position:relative;float: left;left:100px;overflow:hidden;border:" + bordersize + "px #D3D9FF groove;margin:0px";
        for (var r = 0; r < row; r++) {
            for (var c = 0; c < col; c++) {
                GetViewport(r * col + c).style.width = "calc(" + parseInt(100 / col) + "% - " + (parseInt(100 / col) + (bordersize * 2)) + "px)";
                GetViewport(r * col + c).style.height = (WandH[1] - (bordersize * 2)) + "px";
            }
        }
    } catch (ex) { }
    //重置各個Viewport的長寬大小(不顯示時)
    for (var i = row * col; i < Viewport_Total; i++) {
        try {
            GetViewport(i).style = "position:relative;float: right;;width:0px;" + "height:" + 0 + "px;overflow:hidden;border:" + 0 + "px #D3D9FF groove;margin:0px";
        } catch (ex) { }
    }
    // window.onresize();
}