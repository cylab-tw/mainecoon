window.onload = async function()
{
    let WSIS = new WSIServer();
    await WSIS.init();

    let Patient = new DicomFile(WSIS);
    await Patient.init();
}