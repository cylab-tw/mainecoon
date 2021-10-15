class RightAside
{
    constructor(DicomFile)
    {
        this.ID = "RightAside";
        this.DicomFile = DicomFile;
    }

    init()
    {
        this.Create();
    }

    Create()
    {
        this.CreateSlideLabel();
        this.CreateSpecimens();
    }

    CreateSlideLabel()
    {
        //LabelText BarcodeValue
        let metadata = this.DicomFile.Study.Series.MetaData[0];

        let LabelText = metadata.hasOwnProperty("LabelText") ? metadata.LabelText : "";
        let BarcodeValue = metadata.hasOwnProperty("BarcodeValue") ? metadata.BarcodeValue : "";
        
        let textContent =   "LabelText: " + LabelText + "\n" +
                            "BarcodeValue: " + BarcodeValue + "\n";

        let MenuText = "SlideLabel";
        let MenuID = MenuText + "Menu";
        
        let myMenu = new Menu(this.ID, MenuID, MenuText, textContent);
        myMenu.init();
    }

    CreateSpecimens()
    {
        //AnatomicStructure 
        let metadata = this.DicomFile.Study.Series.MetaData[0].SpecimenDescriptionSequence;
        console.log(metadata);

        let AnatomicStructure = "";
        if (metadata.hasOwnProperty("00082228") && metadata["00082228"].Value[0].hasOwnProperty("00080104"))
        {
            AnatomicStructure = metadata["00082228"].Value[0]["00080104"].hasOwnProperty("Value") ? metadata["00082228"].Value[0]["00080104"].Value[0] : "";
        }

        let textContent =   "AnatomicStructure: " + AnatomicStructure + "\n" ;

        let MenuText = "Specimens";
        let MenuID = MenuText + "Menu";
        
        let myMenu = new Menu(this.ID, MenuID, MenuText, textContent);
        myMenu.init();
    }
}