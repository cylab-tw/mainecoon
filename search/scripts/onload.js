window.onload = function () {
  //setInterval(function () { createTable() }, 1000);
  function onLosdSerch() {
    getByid("searchButton").onclick();
  }
  loadLdcmview(onLosdSerch);
}

function PasswordCheck() {
  try {
    var str = "" + getByid('PasswordText').value;
    if (str && str.length == 3) {
      if (parseInt(str.charAt(0)) * parseInt(str.charAt(2) % parseInt(str.charAt(1))) == 1) {
        if (parseInt(str.charAt(2)) * parseInt(str.charAt(1)) + parseInt(str.charAt(0)) == 7) {
          return true;
        }
      }
    }
  } catch (ex) { }
  alert("wrong password");
  return false;
}
/* var formInput = ["StudyDate", "StudyTime", "AccessionNumber", "ModalitiesInStudy", "ReferringPhysicianName",
      "PatientName", "PatientID", "StudyID", "StudyInstanceUID"];
*/
var Patient = {};
var PatientMark = [];
var DicomTags = {};
var ConfigLog;
var configOnload = false;

var LoacationSercher = "";
var UidListCount = 0;
var UidListCount2 = 0;

var SerchState = 0;
function createTable() {
  var Body = document.getElementById("body");
  if (UidListCount2 == UidListCount) return;
  if (!getByid("floatTable")) {
    // var floatTable = document.createElement("table");
    // floatTable.id = "floatTable";
    //floatTable.style.display = "none";
    // Body.appendChild(floatTable);
    //var floatTable = document.createElement("table");
    // floatTable.id = "floatTable2";
    // floatTable.style.display = "none";
    //Body.appendChild(floatTable);
  } else {
    // getByid("floatTable").style.display = getByid("floatTable2").style.display = "none";
  }
  UidListCount2 = UidListCount;
  if (getByid("myTable1")) {
    var elem = getByid("myTable1");
    elem.parentElement.removeChild(elem);
  }
  var PatientID_list = [];
  var PatientName_list = [];
  var Sex_list = [];
  var BirthDate_list = [];
  var Modality_list = [];
  var AccessionNumber_list = [];
  var StudyDate_list = [];

  var StudyTime_list = [];
  var StudyDescription_list = [];
  var SeriesAmount_list = [];
  var SopAmount_list = [];

  var StudyUID_list = [];
  var StudyObj_list = [];
  for (var i = 0; i < Patient.StudyAmount; i++) {
    var flag = 0;
    for (var j = 0; j < Patient.Study[i].SeriesAmount; j++) {
      if (flag == 1) break;
      for (var k = 0; k < Patient.Study[i].Series[j].SopAmount; k++) {
        PatientID_list.push(Patient.Study[i].Series[j].Sop[k].PatientID);
        PatientName_list.push(Patient.Study[i].Series[j].Sop[k].PatientName);
        Sex_list.push(Patient.Study[i].Series[j].Sop[k].Sex);
        BirthDate_list.push(Patient.Study[i].Series[j].Sop[k].BirthDate);
        Modality_list.push(Patient.Study[i].Series[j].Sop[k].ModalitiesInStudy);
        AccessionNumber_list.push(Patient.Study[i].Series[j].Sop[k].AccessionNumber);
        //date = ("" + date).replace(/^(\d{4})(\d\d)(\d\d)$/, '$1/$2/$3');
        // time = ("" + time).replace(/^(\d{2})(\d\d)(\d\d)/, '$1:$2:$3');
        if (Patient.Study[i].Series[j].Sop[k].StudyDate != undefined)
          StudyDate_list.push(("" + Patient.Study[i].Series[j].Sop[k].StudyDate).replace(/^(\d{4})(\d\d)(\d\d)$/, '$1/$2/$3'));
        if (Patient.Study[i].Series[j].Sop[k].StudyTime != undefined)
          StudyTime_list.push(("" + Patient.Study[i].Series[j].Sop[k].StudyTime).replace(/^(\d{2})(\d\d)(\d\d)/, '$1:$2:$3').substr(0, 8));
        StudyDescription_list.push(Patient.Study[i].Series[j].Sop[k].StudyDescription);

        SeriesAmount_list.push(Patient.Study[i].SeriesAmount);
        var SopAmount1 = 0;
        for (var i2 = 0; i2 < Patient.Study[i].Series.length; i2++) {
          SopAmount1 += Patient.Study[i].Series[i2].SopAmount;
        }
        SopAmount_list.push(SopAmount1);
        StudyUID_list.push(Patient.Study[i].StudyUID);
        StudyObj_list.push(Patient.Study[i]);
        flag = 1;
        break;
      }
    }
  }
  if (PatientID_list.length == 0) return;
  rows = PatientID_list.length;
  lines = 1;

  var Body = document.getElementById("body");
  var Table = document.createElement("table");
  Table.id = "myTable1";
  Table.style.color = "#ffffff";

  Table.className = "table table-dark table-striped";
  Table.setAttribute("border", 1);
  var row0 = Table.insertRow(0);
  // row0.className = "table-primary ";
  row0.style.color = "#ffffff";
  row0.style.backgroundColor = "#203852";
  var cells0 = row0.insertCell(0);
  cells0.innerHTML = "Patient ID";
  var cells1 = row0.insertCell(1);
  cells1.innerHTML = "Patient's Name";
  var cells1 = row0.insertCell(2);
  cells1.innerHTML = "Sex";
  var cells1 = row0.insertCell(3);
  cells1.innerHTML = "BirthDate";
  var cells2 = row0.insertCell(4);
  cells2.innerHTML = "Modality";
  var cells5 = row0.insertCell(5);
  cells5.innerHTML = "Accession Number";
  var cells1 = row0.insertCell(6);
  cells1.innerHTML = "Study Date";
  var cells1 = row0.insertCell(7);
  cells1.innerHTML = "Study Time";
  var cells1 = row0.insertCell(8);
  cells1.innerHTML = "Study Description";
  var cells3 = row0.insertCell(9);
  cells3.innerHTML = "#S";
  var cells3 = row0.insertCell(10);
  cells3.innerHTML = "#I";

  function undefined2null(str) {
    return str == "undefined" ? "" : str;
  }
  for (var i = 1; i <= rows; i++) {
    var row = Table.insertRow(i);
    row.className = "PatientRow";
    // for (var j = 0; j < lines; j += 4) {
    var cells = row.insertCell(0);
    cells.innerHTML = undefined2null("" + PatientID_list[i - 1]);
    cells = row.insertCell(1);
    cells.innerHTML = undefined2null("" + PatientName_list[i - 1]);
    cells = row.insertCell(2);
    cells.innerHTML = undefined2null("" + Sex_list[i - 1]);
    cells = row.insertCell(3);
    cells.innerHTML = undefined2null("" + BirthDate_list[i - 1]);
    cells = row.insertCell(4);
    cells.innerHTML = undefined2null("" + Modality_list[i - 1]);
    cells = row.insertCell(5);
    cells.innerHTML = undefined2null("" + AccessionNumber_list[i - 1]);
    cells = row.insertCell(6);
    cells.innerHTML = undefined2null("" + StudyDate_list[i - 1]);

    cells = row.insertCell(7);
    cells.innerHTML = undefined2null("" + StudyTime_list[i - 1]);
    cells = row.insertCell(8);
    cells.innerHTML = undefined2null("" + StudyDescription_list[i - 1]);
    cells = row.insertCell(9);
    cells.innerHTML = undefined2null("" + SeriesAmount_list[i - 1]);
    cells = row.insertCell(10);
    cells.innerHTML = undefined2null("" + SopAmount_list[i - 1]);

    row.Study = StudyObj_list[i - 1];
    var str = "";
    //str += "PatientID=" + Null2Empty(encodeURI(list[i - 1]));
    //str += "&StudyDate=" + Null2Empty(encodeURI(StudyDate_list[i - 1]));
    str += "StudyInstanceUID=" + Null2Empty(encodeURI(StudyUID_list[i - 1]));
    //str += "&PatientName=" + Null2Empty(encodeURI(PatientName_list[i - 1]));
    //str += "&ModalitiesInStudy=" + Null2Empty(encodeURI(Modality_list[i - 1]));

    row.alt = ConfigLog.QIDO.target + '?' + str;
    row.onclick = function () {
      let scrollY = window.scrollY;
      //window.open(this.alt, '_blank');
      var Body = document.getElementById("body");
      var Table = document.createElement("table");
      Table.id = "floatTable";
      Table.style.color = "#000000";
      Table.style.position = "absolute"
      Table.className = "table table-striped";
      Table.style.backgroundColor="rgb(210,222,239)"
      Table.setAttribute("border", 2);
      Table.style.borderColor='black';

      for (var c = 0; c < getClass("PatientRow").length; c++)getClass("PatientRow")[c].style.height = "";
      //
      var row = Table.insertRow(0);
      var cell = row.insertCell(0); cell.innerHTML = "<b>Open This Study </b><img src='../image/icon/goto.png'></img>";
      cell.alt = ConfigLog.QIDO.target + '?' + "StudyInstanceUID=" + this.Study.StudyUID;
      cell.onclick = function () { window.open(this.alt, '_blank'); }
      row.insertCell(1).innerHTML = "StudyInstanceUID=" + this.Study.StudyUID;
      row.className = "SecondRow2";

      var Table2 = document.createElement("table");
      Table2.id = "floatTable2";
      Table2.style.color = "#000000";
      Table2.style.position = "absolute"
      Table2.className = "table table-striped";
      Table2.style.backgroundColor="rgb(255,242,204)"
      Table2.setAttribute("border", 2);
      Table2.style.borderColor='black';

      var row0 = Table2.insertRow(0);
      row0.insertCell(0).innerHTML = "<img src='../image/icon/x.png' onclick='hidefloatTable()'></img>";
      row0.insertCell(1).innerHTML = "Modality";
      row0.insertCell(2).innerHTML = "Series Description";
      row0.insertCell(3).innerHTML = "Series Number";
      row0.insertCell(4).innerHTML = "#I";
      row0.style.color = "#FFFFFF";
      row0.style.backgroundColor = "#203852";
     // row0.className = "SecondRow";
      //row0.style.backgroundColor = "#d8dafe";
      //row0.className="Primary";
      for (var c = 0; c < this.Study.Series.length; c++) {
        var row = Table2.insertRow(c + 1);
        var cell = row.insertCell(0); cell.innerHTML = "<b>Open This Series </b><img src='../image/icon/goto.png'></img>";
        cell.alt = ConfigLog.QIDO.target + '?' + "StudyInstanceUID=" + this.Study.StudyUID + "&" + "SeriesInstanceUID=" + this.Study.Series[c].SeriesUID;
        cell.onclick = function () { window.open(this.alt, '_blank'); }
        row.insertCell(1).innerHTML = undefined2null("" + this.Study.Series[c].Sop[0].ModalitiesInStudy);//"SeriesInstanceUID=" + this.Study.Series[c].SeriesUID;
        row.insertCell(2).innerHTML = undefined2null("" + this.Study.Series[c].Sop[0].SeriesDescription);
        row.insertCell(3).innerHTML = undefined2null("" + this.Study.Series[c].Sop[0].SeriesNumber);;
        row.insertCell(4).innerHTML = "" + this.Study.Series[c].Sop.length;
        row.setAttribute("border", 3);
        row.style.borderColor='black';
        row.className = "SecondRow";
      }
      Body.appendChild(Table);
      Body.appendChild(Table2);

      try {
        getByid("floatTable").parentNode.replaceChild(Table, getByid("floatTable"));
        getByid("floatTable2").parentNode.replaceChild(Table2, getByid("floatTable2"));
      } catch (ex) { console.log(ex); }

      Table2.style.marginLeft = (30) + 'px';// Table.style.marginLeft = (this.getClientRects()[0].x) - (getByid("myTable1").getClientRects()[0].x) +
      Table.style.marginLeft = (30) + 'px';// 
      Table2.style.marginTop = (this.getClientRects()[0].y) + (this.getClientRects()[0].height * 1) - (getByid("myTable1").getClientRects()[0].y) + 'px';
      Table.style.marginTop = (parseInt(Table2.style.marginTop) -2) + (Table2.getClientRects()[0].height) + 'px';

      this.style.height = (this.getClientRects()[0].height) * (this.Study.Series.length + 3) + (5) + "px";
      getByid("floatTable").style.display = getByid("floatTable2").style.display = "";

      var Table = getByid("myTable1");
      Body.appendChild(Table);
      try {
        getByid("myTable1").parentNode.replaceChild(Table, getByid("myTable1"));
      } catch (ex) { console.log(ex); }
      window.scroll(0, scrollY);
      getByid("myTable1").style.backgroundColor="rgba(127,127,127,0.7)";
      getByid("floatTable2").style.width="calc(100% - 30px)";
      getByid("floatTable").style.width="calc(100% - 30px)";
    };
    //}
  }
  getByid("loadingSpan").style.display = "none";


  try {
    if (getByid("floatTable") && getByid("floatTable2")) {
      var table1 = getByid("floatTable"), table2 = getByid("floatTable2");
      Body.appendChild(table1);
      Body.appendChild(table2);
      getByid("floatTable").parentNode.replaceChild(table1, getByid("floatTable"));
      getByid("floatTable2").parentNode.replaceChild(table2, getByid("floatTable2"));
    }
  } catch (ex) { console.log(ex); }


  Body.appendChild(Table);
  try {
    getByid("myTable1").parentNode.replaceChild(Table, getByid("myTable1"));
  } catch (ex) { console.log(ex); }
}

function loadLdcmview(onLosdSerch) {
  labelPadding = 5;
  Patient.patientName = '';
  Patient.StudyAmount = 0;
  Patient.Study = [];
  readConfigJson("../data/config.json", onLosdSerch);
}