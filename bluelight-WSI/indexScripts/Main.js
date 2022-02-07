var WSIS = undefined;
var Patient = undefined;
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






    
    let JCG = new JsonConfigGetter("../data/testOpenSeadragonImageInfo.json");
    let info = await JCG.getConfig();

    MyViewer = new OpenSeadragon({
        id: ViewerElementID,
        showNavigationControl: false,
        tileSources: info
      });

    // MyViewer = new Viewer(ViewerElementID, Patient, dynamic_Mode);
    // MyViewer.init();
    // console.log(MyViewer); 
}