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
        if (metadata == undefined) return;

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
        //AnatomicStructure 解剖位置
        let metadata = this.DicomFile.Study.Series.MetaData[0].SpecimenDescriptionSequence;
        if (metadata == undefined) return;

        let AnatomicStructure = "";
        if (metadata.hasOwnProperty("00082228") && metadata["00082228"].Value[0].hasOwnProperty("00080104"))
        {
            AnatomicStructure = metadata["00082228"].Value[0]["00080104"].hasOwnProperty("Value") ? metadata["00082228"].Value[0]["00080104"].Value[0] : "";
        }

        let textContent =   "AnatomicStructure: " + AnatomicStructure + "\n" ;

        //標本資訊的前置步驟
        let SpecimenPreparationStepContentText = "";
        let SpecimenPreparationSequence = metadata.hasOwnProperty("00400610") ? metadata["00400610"].Value : "";
        
        if (SpecimenPreparationSequence != "" && SpecimenPreparationSequence != undefined)
        {
            for(let i = 0; i < SpecimenPreparationSequence.length; i++)
            {
                let SpecimenPreparationStepContentItemSequence = SpecimenPreparationSequence[i].hasOwnProperty("00400612") ? SpecimenPreparationSequence[i]["00400612"] : "";

                let SpecimenPreparationStepContentItem = SpecimenPreparationStepContentItemSequence.hasOwnProperty("Value") ? SpecimenPreparationStepContentItemSequence.Value : "";
                
                if (SpecimenPreparationStepContentItem == "" || SpecimenPreparationStepContentItem == undefined)
                break;


                //先判斷這步是不是染色
                if (SpecimenPreparationStepContentItem[1].hasOwnProperty("0040A168"))
                if (SpecimenPreparationStepContentItem[1]["0040A168"].hasOwnProperty("Value"))
                if (SpecimenPreparationStepContentItem[1]["0040A168"].Value[0].hasOwnProperty("00080104"))
                if (SpecimenPreparationStepContentItem[1]["0040A168"].Value[0]["00080104"].hasOwnProperty("Value"))
                if (SpecimenPreparationStepContentItem[1]["0040A168"].Value[0]["00080104"].Value[0] == "Staining")
                {
                    //是染色
                    //通常前兩個不是染色劑，從第三個開始列出有多少染色劑，index = 2 開始。
                    for (let StainIndex = 2; StainIndex < SpecimenPreparationStepContentItem.length; StainIndex++)
                    {
                        let StainItem = SpecimenPreparationStepContentItem[StainIndex];

                        if (StainItem.hasOwnProperty("0040A043") && StainItem.hasOwnProperty("0040A168"))
                        {
                            let ConceptNameCodeSequence = StainItem["0040A043"].hasOwnProperty("Value") ? StainItem["0040A043"].Value[0] : "";
                            let ConceptCodeSequence = StainItem["0040A168"].hasOwnProperty("Value") ? StainItem["0040A168"].Value[0] : "";

                            let ConceptNameCodeSequence_CodeMeaning = ConceptNameCodeSequence.hasOwnProperty("00080104") ? ConceptNameCodeSequence["00080104"] : "";
                            let ConceptCodeSequence_CodeMeaning = ConceptCodeSequence.hasOwnProperty("00080104") ? ConceptCodeSequence["00080104"] : "";

                            let ConceptNameCodeSequence_CodeMeaning_Value = ConceptNameCodeSequence_CodeMeaning.hasOwnProperty("Value") ? ConceptNameCodeSequence_CodeMeaning.Value[0] : "";
                            let ConceptCodeSequence_CodeMeaning_Value = ConceptCodeSequence_CodeMeaning.hasOwnProperty("Value") ? ConceptCodeSequence_CodeMeaning.Value[0] : "";

                            SpecimenPreparationStepContentText += "Stain" + ": " + ConceptCodeSequence_CodeMeaning_Value + "\n";
                        }
                    }
                }
                //不是染色
                else
                {
                    SpecimenPreparationStepContentItem = SpecimenPreparationStepContentItemSequence.Value[SpecimenPreparationStepContentItemSequence.Value.length-1];
                    if (SpecimenPreparationStepContentItem.hasOwnProperty("0040A043") && SpecimenPreparationStepContentItem.hasOwnProperty("0040A168"))
                    {
                        let ConceptNameCodeSequence = SpecimenPreparationStepContentItem["0040A043"].hasOwnProperty("Value") ? SpecimenPreparationStepContentItem["0040A043"].Value[0] : "";
                        let ConceptCodeSequence = SpecimenPreparationStepContentItem["0040A168"].hasOwnProperty("Value") ? SpecimenPreparationStepContentItem["0040A168"].Value[0] : "";
                       
                        let ConceptNameCodeSequence_CodeMeaning = ConceptNameCodeSequence.hasOwnProperty("00080104") ? ConceptNameCodeSequence["00080104"] : "";
                        let ConceptCodeSequence_CodeMeaning = ConceptCodeSequence.hasOwnProperty("00080104") ? ConceptCodeSequence["00080104"] : "";

                        let ConceptNameCodeSequence_CodeMeaning_Value = ConceptNameCodeSequence_CodeMeaning.hasOwnProperty("Value") ? ConceptNameCodeSequence_CodeMeaning.Value[0] : "";
                        let ConceptCodeSequence_CodeMeaning_Value = ConceptCodeSequence_CodeMeaning.hasOwnProperty("Value") ? ConceptCodeSequence_CodeMeaning.Value[0] : "";

                        SpecimenPreparationStepContentText += ConceptNameCodeSequence_CodeMeaning_Value + ": " + ConceptCodeSequence_CodeMeaning_Value + "\n";
                    }
                }
            }
        }

        textContent += SpecimenPreparationStepContentText;


        let MenuText = "Specimens";
        let MenuID = MenuText + "Menu";
        
        let myMenu = new Menu(this.ID, MenuID, MenuText, textContent);
        myMenu.init();

        
    }
}