class LeftAside
{
    constructor(DicomFile)
    {
        this.ID = "LeftAside";
        this.DicomFile = DicomFile;
    }

    init()
    {
        this.Create();
    }

    Create()
    {
        this.CreatePatient();
        this.CreateCase();
    }

    CreatePatient()
    {
        //ID Name Gender Birthday
        let metadata = this.DicomFile.MetaData;
        let ID = metadata.PatientID.hasOwnProperty("Value") ? metadata.PatientID.Value[0] : "";
        let Name = metadata.PatientName.hasOwnProperty("Value") ? metadata.PatientName.Value[0].Alphabetic : "";
        let Gender = metadata.PatientSex.hasOwnProperty("Value") ? metadata.PatientSex.Value[0] : "";
        let Birthday = metadata.PatientBirthDate.hasOwnProperty("Value") ? metadata.PatientBirthDate.Value[0] : "";

        let textContent =   "ID: " + ID + "\n" +
                            "Name: " + Name + "\n"+
                            "Gender: " + Gender + "\n"+
                            "Birthday: " + Birthday + "\n";

        let MenuID = "PatientMenu";
        let MenuText = "Patient";
        
        let myMenu = new Menu(this.ID, MenuID, MenuText, textContent);
        myMenu.init();
    }

    CreateCase()
    {
        //Accession ID Date Time
    }
}