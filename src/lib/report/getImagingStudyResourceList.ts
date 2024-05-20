import _ from "lodash";

async function getImagingStudyResourceList(imagingStudyResponseList: object[]): Promise<object[]> {
    const result: object[] = [];

    _.forEach(imagingStudyResponseList, (imagingStudyResponse) => {
        if (_.has(imagingStudyResponse, "total")) {
            if (_.get(imagingStudyResponse, "total") > 0) {
                const tempImagingStudyResourceList = _.get(imagingStudyResponse, "entry");
                _.forEach(tempImagingStudyResourceList, (tempImagingStudyResource) => {
                    result.push(_.get(tempImagingStudyResource, "resource"));
                })
            }
        }
    })

    return result;
}

export { getImagingStudyResourceList };