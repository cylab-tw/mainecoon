var WSIS = undefined;
var Patient = undefined;
var MyViewer = undefined;
const ViewerElementID = "MyViewer";

var testx = 0;
var testy = 0;

window.onload = async function()
{
    WSIS = new WSIServer();
    await WSIS.init();

    Patient = new DicomFile(WSIS);
    await Patient.init();
    console.log(Patient);

    MyViewer = new Viewer(ViewerElementID, Patient);
    MyViewer.init();
    console.log(MyViewer);
}

