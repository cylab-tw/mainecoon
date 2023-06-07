import _ from "lodash";
import axios, { AxiosRequestHeaders } from "axios";

async function getImagingStudyResponseListByDICOMSeriesInstanceUIDList(seriesInstanceUIDList: string[], querySpecificResourceTypeURL: string, isUseToken: boolean, tokenObject: object): Promise<object[]> {
    const result: object[] = [];

    await Promise.all(seriesInstanceUIDList.map(async (seriesInstanceUID) => {
        const queryFhirServerURL = `${querySpecificResourceTypeURL}&series=${seriesInstanceUID}`;
        if (isUseToken) {
            await axios({
                method: "get",
                url: queryFhirServerURL,
                headers: tokenObject as AxiosRequestHeaders
            }).then(
                (res) => {
                    const response = _.cloneDeep(res.data);
                    result.push(response);
                })
                .catch((error) => console.log(error)
                )
        } else {
            await axios({
                method: "get",
                url: queryFhirServerURL
            }).then(
                (res) => {
                    const response = _.cloneDeep(res.data);
                    result.push(response);
                })
                .catch((error) => console.log(error)
                )
        }
    }))

    return result;
}

export { getImagingStudyResponseListByDICOMSeriesInstanceUIDList };