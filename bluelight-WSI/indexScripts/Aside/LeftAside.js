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
        let Birthday = metadata.PatientBirthDate.hasOwnProperty("Value") ? DateFormat(metadata.PatientBirthDate.Value[0]) : "";

        let textContent =   "ID: " + ID + "\n" +
                            "Name: " + Name + "\n"+
                            "Gender: " + Gender + "\n"+
                            "Birthday: " + Birthday + "\n";

        let MenuText = "Patient";
        let MenuID = MenuText + "Menu";
        
        
        let myMenu = new Menu(this.ID, MenuID, MenuText, textContent);
        myMenu.init();
    }

    CreateCase()
    {
        //Accession ID Date Time
        let metadata = this.DicomFile.Study.MetaData;
        let Accession = metadata.AccessionNumber.hasOwnProperty("Value") ? metadata.AccessionNumber.Value[0] : "";
        let ID = metadata.StudyID.hasOwnProperty("Value") ? metadata.StudyID.Value[0] : "";
        let Date = metadata.StudyDate.hasOwnProperty("Value") ? DateFormat(metadata.StudyDate.Value[0]) : "";
        let Time = metadata.StudyTime.hasOwnProperty("Value") ? TimeFormat(metadata.StudyTime.Value[0]) : "";

        let textContent =   "Accession: " + Accession + "\n" +
                            "ID: " + ID + "\n"+
                            "Date: " + Date + "\n"+
                            "Time: " + Time + "\n";

        let MenuText = "Case";
        let MenuID = MenuText + "Menu";
        
        let myMenu = new Menu(this.ID, MenuID, MenuText, textContent);
        myMenu.init();
    }
}