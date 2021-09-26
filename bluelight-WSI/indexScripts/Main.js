var WSIS = undefined;
var Patient = undefined;
var MyViewer = undefined;
const ViewerElementID = "MyViewer";
const dynamic_Mode = true;

window.onload = async function()
{
    WSIS = new WSIServer();
    await WSIS.init();

    Patient = new DicomFile(WSIS);
    await Patient.init();
    console.log(Patient);

    MyViewer = new Viewer(ViewerElementID, Patient, dynamic_Mode);
    MyViewer.init();
    console.log(MyViewer);

    
    if (dynamic_Mode == true)
    {
        var timer = setInterval(function () {MyViewer.loadShowingCanvas()});
    }
    
}


