class Series
{
    constructor(Study_URL, Series_MetaData_URL)
    {
        this.Study_URL = Study_URL;
        this.Series_MetaData_URL = Series_MetaData_URL;
        this.Instances_URL = undefined;
        this.Instances_MetaData_URL = undefined;
        this.MetaData = {};
        this.Frames = undefined;
    }
}