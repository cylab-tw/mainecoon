var WSIS = undefined;
var Patient = undefined;
var MyViewerConfig = undefined;
var MyViewer = undefined;
var MyLeftAside = undefined;
var MyRightAside = undefined;
const ViewerElementID = "MyViewer";


window.onload = async function()
{
    WSIS = new WSIServer();
    await WSIS.init();
    console.log(WSIS);

    Patient = new DicomFile(WSIS);
    await Patient.init();
    console.log(Patient);

    MyLeftAside = new LeftAside(Patient);
    MyLeftAside.init();

    MyRightAside = new RightAside(Patient);
    MyRightAside.init();

    MyViewerConfig = new OpenSeadragonConfiger(Patient, ViewerElementID);
    await MyViewerConfig.init();
    MyViewer = new OpenSeadragon(MyViewerConfig.getConfig());
}