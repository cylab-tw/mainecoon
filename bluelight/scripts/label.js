function displayWindowLevel(viewportNum0) {
  var viewportNum;
  if (viewportNum0 >= 0) viewportNum = viewportNum0;
  else viewportNum = viewportNumber;
  textWC.value = "originWindowCenter";
  textWW.value = "originWindowWidth";
  textWW.value = "" + parseInt(GetViewport(viewportNum).windowWidthList);
  textWC.value = "" + parseInt(GetViewport(viewportNum).windowCenterList);
  labelWC[viewportNum].innerText = " WC: " + parseInt(GetViewport(viewportNum).windowCenterList) + " WW: " + parseInt(GetViewport(viewportNum).windowWidthList);
}

function DisplaySeriesCount(number, viewportNum0,date) {
  var viewportNum;
  if (viewportNum0 >= 0) viewportNum = viewportNum0;
  else viewportNum = viewportNumber;
  SeriesCount = 1;
  for (var i = 0; i < Patient.StudyAmount; i++) {
    for (var j = 0; j < Patient.Study[i].SeriesAmount; j++) {
      if (Patient.Study[i].Series[j].SeriesUID == NowAlt) {
        SeriesCount = Patient.Study[i].Series[j].SopAmount;
        if (SeriesCount == 1) SeriesCount = 2;
        if (number == null) {
          if (labelRB[viewportNum].innerText.indexOf('/') >= 1) {
            labelRB[viewportNum].innerText = labelRB[viewportNum].innerText.substr(0, labelRB[viewportNum].innerText.indexOf('/') + 1) + (SeriesCount - 1) + "\n" + date;
            return;
          }
        } else {
          labelRB[viewportNum].innerText = "Im: " + number + "/" + (SeriesCount -0) + "\n" + date;
          return;
        }
      }
    }
  }
  labelRB[viewportNum].innerText = "Im: " + number + "/" + SeriesCount + "\n" + date;
}

function putLabel() {
  for (var i = 0; i < Viewport_Total; i++) {
      getClass("labelLT")[i].style.top = labelPadding + "px";
      getClass("labelLT")[i].style.left = labelPadding + "px";
      getClass("labelRT")[i].style.top = labelPadding + "px";
      getClass("labelRT")[i].style.right = labelPadding + "px";
      getClass("labelRB")[i].style.right = labelPadding + "px";
      getClass("labelRB")[i].style.bottom = labelPadding + "px";
      getClass("labelXY")[i].style.left = labelPadding + "px";
      getClass("labelXY")[i].style.bottom = labelPadding + "px";
      getClass("labelWC")[i].style.left = labelPadding + "px";
      getClass("labelWC")[i].style.bottom = labelPadding + getClass("labelXY")[i].clientHeight + "px";
  }
}

function displayAnnotation() {
  for (var i = 0; i < Viewport_Total; i++) {
      if (openAnnotation == true) {
          getClass("labelWC")[i].style.display = "";
          getClass("labelLT")[i].style.display = "";
          getClass("labelRT")[i].style.display = "";
          getClass("labelRB")[i].style.display = "";
          getClass("labelXY")[i].style.display = "";
          getClass("labelWC")[i].style.display = "";
          getClass("leftRule")[i].style.display = "";
          getClass("downRule")[i].style.display = "";
      } else {
          getClass("labelWC")[i].style.display = "none";
          getClass("labelLT")[i].style.display = "none";
          getClass("labelRT")[i].style.display = "none";
          getClass("labelRB")[i].style.display = "none";
          getClass("labelWC")[i].style.display = "none";
          getClass("labelXY")[i].style.display = "none";
          getClass("leftRule")[i].style.display = "none";
          getClass("downRule")[i].style.display = "none";
      }
  }
  putLabel();
}