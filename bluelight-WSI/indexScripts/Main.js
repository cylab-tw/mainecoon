var WSIS = undefined;
var Patient = undefined;
var Viewer = undefined;

window.onload = async function()
{
    WSIS = new WSIServer();
    await WSIS.init();

    Patient = new DicomFile(WSIS);
    await Patient.init();
    console.log(Patient);
}