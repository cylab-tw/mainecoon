window.onload = async function()
{
    let WSIS = new WSIServer();
    await WSIS.init();

    let Patient = new DicomFile(WSIS.QIDO_Url);
    await Patient.init();
    console.log(Patient.MetaData);
}