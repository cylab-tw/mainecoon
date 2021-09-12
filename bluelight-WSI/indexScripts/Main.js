window.onload = async function()
{
    let WSIS = new WSIServer();
    await WSIS.connectToServer();

}