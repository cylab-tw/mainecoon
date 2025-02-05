import React, {useContext, useEffect, useState} from 'react';
import {Icon} from "@iconify/react";
import {combineUrl, fetchPatientDetails} from "../../lib/search/index.js";
import {ServerContext} from "../../lib/ServerContext.jsx";
import {Link} from "react-router-dom";
import {getAccessToken} from "../../token.js";

function Thumbnail({ seriesUid, studyUid, server }) {
    const [thumbnailUrl, setThumbnailUrl] = useState('');

    useEffect(() => {
        async function fetchThumbnail() {
            try {
                const oauthToken = await getAccessToken();
                const res = await fetch(
                    `${combineUrl(server)}/studies/${studyUid}/series/${seriesUid}/thumbnail`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'image/jpeg',
                            Authorization: `Bearer ${oauthToken}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error('Failed to fetch thumbnail');
                }

                const data = window.URL.createObjectURL(await res.blob());
                setThumbnailUrl(data);
            } catch (error) {
                console.error('Error fetching thumbnail:', error);
            }
        }

        if (seriesUid && studyUid && server) {
            const delayThumbnailLoad = setTimeout(() => {
                fetchThumbnail();
            }, 500); // 延迟2秒加载

            return () => clearTimeout(delayThumbnailLoad);
        }
    }, [seriesUid, studyUid, server]);

    return (
        <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="break-all border bg-white w-full text-xs h-[100px] object-cover"
        />
    );
}


const SearchResult = ({Result}) => {
    const [previewImage, setPreviewImage] = useState([]);
    const patientDetails = fetchPatientDetails(Result);
    const studyInstanceUID = patientDetails.studyInstanceUID;
    const [seriesUID, setSeriesUID] = useState('');
    const [server, setServer] = useContext(ServerContext);
    const [oauthToken, setOauthToken] = useState('');

    function OnClick() {
        window.open(`../viewer?server=${server}&studyUid=${studyInstanceUID}`, '_blank');
    }

    // Get keycloak access token
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await getAccessToken();
                setOauthToken(token);
            } catch (error) {
                console.error('Failed to get access token:', error);
            }
        };
        fetchToken();
    }, []);

    const [ann,setAnn] = useState(0)
    useEffect(() => {
        let Y = 0;
        const fetchData = async () => {
            try {
                let seriesUid = [];

                // 判斷是否有 oauthToken
                const headers = {
                    'Content-Type': 'application/json',
                };

                // 如果有 oauthToken，則加入 Authorization 頭
                if (oauthToken) {
                    headers['Authorization'] = `Bearer ${oauthToken}`;
                }

                // 執行請求
                const result = await fetch(`${combineUrl(server)}/studies/${studyInstanceUID}/series`, {
                    method: 'GET',
                    headers,
                });

                // 檢查請求是否成功
                if (!result.ok) {
                    throw new Error('Failed to fetch series data');
                }

                const metadatas = await result.json();

                setPreviewImage(metadatas?.map((metadata) => {
                    const Attribute = metadata?.["00080060"]?.Value;
                    if (Attribute && Attribute.length > 0) {
                        if (Attribute[0] === "SM") {
                            seriesUid.push(metadata['0020000E'].Value?.[0]);
                            return metadata['0020000E'].Value?.[0];
                        }
                        if (Attribute[0] === "ANN") {
                            Y += 1;
                        }
                        return false;
                    }
                }).filter(Boolean));

                setSeriesUID(seriesUid[0]);
                setAnn(Y);
            } catch (error) {
                console.error('fetchMetadataFail:', error);
            }
        };

        // 如果有 oauthToken 或者允許沒有 token，則執行 fetchData
        if (oauthToken || !oauthToken) {
            fetchData();
        }

    }, [oauthToken, server, studyInstanceUID]);


    const genderData = {
        F: {bgColor: "bg-pink-500", icon: "ph:gender-female-bold", label: "Female",},
        M: {bgColor: "bg-blue-600", icon: "tdesign:gender-male", label: "Male",},
        default: {bgColor: "bg-green-600/80", icon: "ion:male-female", label: "Other"},
    }

    const gender = genderData[patientDetails.patientSex] || genderData.default;

    return (
        <>
            <tr className="m-2 hover:bg-gray-100 cursor-pointer group max-h-2" key={patientDetails.patientID}
                onClick={OnClick}>
                <td className="border-2 border-l-0 group-first:border-t-0 p-2.5 group-last:border-b-0">{patientDetails.patientID}</td>
                <td className="border-2 group-first:border-t-0 p-2.5 group-last:border-b-0">{patientDetails.patientName}</td>
                <td className="border-2 w-1/12 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">{patientDetails.patientBirthDate}</td>
                <td className="border-2 w-10 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">
                    <div className="flex items-center justify-center">
                        <div
                            className={`rounded-md ${gender.bgColor} w-16 py-1 px-2  mx-auto flex items-center justify-center font-bold `}>
                            {/*<Icon icon={gender.icon} width="24" height="24" className="text-white"/>*/}
                            <span className="mx-2 text-white">{gender.label}</span>
                        </div>
                    </div>
                </td>
                <td className="border-2 p-2.5 group-first:border-t-0 group-last:border-b-0">{patientDetails.accessionNumber}</td>
                <td className="border-2 w-1/12 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">{patientDetails.studyDate}</td>
                <td className="border-2 w-1/12 p-2.5 text-center border-r-0 group-first:border-t-0 group-last:border-b-0">
                    <div className="flex flex-wrap w-72">
                        {previewImage?.map((seriesUid) => (
                            <Link key={seriesUid}
                                  className="mr-2"
                                  onClick={(e) => {
                                      e.stopPropagation()
                                      location.href = `../viewer?server=${server}&studyUid=${studyInstanceUID}&seriesUid=${seriesUid}`
                                  }}
                            >
                                {/* <img key={seriesUid}
                                    //  src={`${combineUrl(server)}/studies/${studyInstanceUID}/series/${seriesUid}/thumbnail`}
                                     src = {fetchThumbnail(seriesUid)}
                                     className="break-all border bg-white text-xs h-[70px] w-[70px] object-cover"
                                     alt={seriesUid}
                                /> */}
                                <Thumbnail seriesUid={seriesUid} studyUid={studyInstanceUID} server={server} />
                            </Link>
                        ))}
                    </div>
                </td>
                {/*<td className="">{ann}</td>*/}
            </tr>
        </>
    );
}

export default SearchResult;
