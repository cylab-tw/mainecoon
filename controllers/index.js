/* eslint-disable no-unused-vars */
import {Router} from "express";


const router = Router();
import base64 from 'base64-js';
import axios from 'axios';
import * as fs from "fs";
import * as path from "path";

/** TODO: deprecate this */



// function getEncodedData(coordinates) {
//     const dataBytes = new Uint8Array(coordinates.length * 8);
//     for (let i = 0; i < coordinates.length; i++) {
//         const [lat, lon] = coordinates[i];
//         const latBytes = new Float32Array([lat]);
//         const lonBytes = new Float32Array([lon]);
//         dataBytes.set(new Uint8Array(latBytes.buffer), i * 8);
//         dataBytes.set(new Uint8Array(lonBytes.buffer), i * 8 + 4);
//     }
//     const encodedData = base64.fromByteArray(dataBytes);
//     return encodedData;
// }

async function fetchMetadata(studiesID, seriesID) {
    const Studiesurl = `https://ditto.dicom.tw/dicom-web/studies/${studiesID}/instances`;

    //console.log('Studiesurl:', Studiesurl);

    try {
        const response = await axios.get(Studiesurl);

        const instanceUIDs = response.data.map(instance => instance["00080018"].Value[0]);

        const metadataPromises = instanceUIDs.map(async instanceUID => {
            const url = `https://ditto.dicom.tw/dicom-web/studies/${studiesID}/series/${seriesID}/instances/${instanceUID}/metadata`;
            //console.log('URL:', url);
            const metadataResponse = await axios.get(url);
            return metadataResponse.data;
        });

        const allMetadata = (await Promise.all(metadataPromises)).flat();
        //console.log('allMetadata:', allMetadata);

        const invalidInstanceWithNone = allMetadata.find(metadata => metadata["00080008"] && metadata["00080008"].Value && metadata["00080008"].Value.includes("NONE"));
        const invalidInstanceWithVolume = allMetadata.find(metadata => metadata["00080008"] && metadata["00080008"].Value && metadata["00080008"].Value.includes("VOLUME"));
        const invalidInstanceWithAnn = allMetadata.find(metadata => metadata["00080060"] && metadata["00080060"].Value && metadata["00080060"].Value.includes("ANN"));

        if (!invalidInstanceWithNone && !invalidInstanceWithVolume && !invalidInstanceWithAnn) {
            console.error('No matching instances found.');
            return null;
        }

        const extractedData = {};

        const requiredTags = [
            "00080016", // SOP Class UID
            "00080018", // SOP Instance UID
            "00080020",
            "00080030",
            "00080050",
            "00080060",
            "00080070",
            "00080090",
            "00081140",
            "00100020",
            "00100030",
            "00100040",
            "0020000D", // Study Instance UID
            "0020000E", // Series Instance UID
            "00200011",
            "00200013",
            "00200052",
            "00100010"
        ];

        if (invalidInstanceWithNone) {
            requiredTags.forEach(tag => {
                if (invalidInstanceWithNone[tag]) {
                    extractedData[tag] = { value: invalidInstanceWithNone[tag] };
                }
            });
        } else if (invalidInstanceWithVolume) {
            requiredTags.forEach(tag => {
                if (invalidInstanceWithVolume[tag]) {
                    extractedData[tag] = { value: invalidInstanceWithVolume[tag] };
                }
            });
        } else if (invalidInstanceWithAnn) {
            requiredTags.forEach(tag => {
                if (invalidInstanceWithAnn[tag]) {
                    extractedData[tag] = { value: invalidInstanceWithAnn[tag] };
                }
            });
        }

        return extractedData;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        throw error;
    }
}
const getEncodedData = (coordinates) => {
    const dataBytes = new Uint8Array(coordinates.length * 8);
    for (let i = 0; i < coordinates.length; i++) {
        const [lat, lon] = coordinates[i];
        const latBytes = new Float32Array([lat]);
        const lonBytes = new Float32Array([lon]);
        dataBytes.set(new Uint8Array(latBytes.buffer), i * 8);
        dataBytes.set(new Uint8Array(lonBytes.buffer), i * 8 + 4);
    }
    return base64.fromByteArray(dataBytes);
};

const generateGroupID = () => {
    return `2.25.${Math.floor(Math.random() * 1e16)}`; // Random unique identifier
};


const convertBase64 = (items) => {
    let combinedResponses = [];

    // Separate tracking for POLYLINE and POLYGON indexing and coordinates
    let polylineCoordinates = [];
    let polygonCoordinates = [];
    let polylineCurrentIndex = 1; // Start index for POLYLINE from 1
    let polygonCurrentIndex = 1; // Start index for POLYGON from 1
    let polylineIndexDict = {};
    let polygonIndexDict = {};

    // Iterate through each item and generate DICOM objects for each type
    items.forEach((item, idx) => {
        if (!item.type || !item.coordinates) {
            throw new Error('Invalid item in the array');
        }

        // Parse coordinates
        const parsedCoordinates = item.coordinates.map(coord => {
            const [lat, lon] = coord.replace(/[()]/g, '').split(',').map(parseFloat);
            return [lat, lon];
        });

        if (item.type === 'POLYLINE') {
            // For POLYLINE, add coordinates to the combined list and update index dictionary
            polylineCoordinates = polylineCoordinates.concat(parsedCoordinates);
            polylineIndexDict[idx] = polylineCurrentIndex;
            polylineCurrentIndex += parsedCoordinates.length; // Increment index by the length of parsed coordinates * 2

        } else if (item.type === 'POLYGON') {
            // For POLYGON, add coordinates to the combined list and update index dictionary
            polygonCoordinates = polygonCoordinates.concat(parsedCoordinates);
            polygonIndexDict[idx] = polygonCurrentIndex;
            polygonCurrentIndex += parsedCoordinates.length * 2; // Increment index by the length of parsed coordinates * 2

        } else {
            // For other types, create separate DICOM object
            const encodedCoordinates = getEncodedData(parsedCoordinates);
            let dicomObject = {
                "0040A180": {
                    "vr": "US",
                    "Value": [1]
                },
                "00660016": {
                    "vr": "OF",
                    "InlineBinary": encodedCoordinates
                },
                "0066002F": { "vr": "SQ" },
                "00660030": { "vr": "SQ" },
                "006A0003": {
                    "vr": "UI",
                    "Value": [generateGroupID()]
                },
                "006A0005": { "vr": "LO", "Value": [item.GroupName] },
                "006A0007": { "vr": "CS", "Value": ["MANUAL"] },
                "006A0009": {
                    "vr": "SQ",
                    "Value": [
                        {
                            "00080100": {
                                "vr": "SH",
                                "Value": ["2681000"]
                            },
                            "00080102": {
                                "vr": "SH",
                                "Value": ["SCT"]
                            },
                            "00080104": {
                                "vr": "LO",
                                "Value": ["Anatomical Structure"]
                            }
                        }
                    ]
                },
                "006A000A": {
                    "vr": "SQ",
                    "Value": [
                        {
                            "00080100": {
                                "vr": "SH",
                                "Value": ["98790000"]
                            },
                            "00080102": {
                                "vr": "SH",
                                "Value": ["SCT"]
                            },
                            "00080104": {
                                "vr": "LO",
                                "Value": ["Nucleus"]
                            }
                        }
                    ]
                },
                "006A000C": { "vr": "UL", "Value": [1] },
                "006A000D": { "vr": "CS", "Value": ["YES"] },
                "00700023": { "vr": "CS", "Value": [item.type] }
            };

            // Add DICOM object to responses
            combinedResponses.push(dicomObject);
        }
    });

    // Handle POLYLINE separately, combining all POLYLINE coordinates into a single DICOM object
    if (polylineCoordinates.length > 0) {
        const encodedCoordinates = getEncodedData(polylineCoordinates);
        const encodedIndex = getEncodedIndex(polylineIndexDict);

        let polylineDicomObject = {
            "0040A180": {
                "vr": "US",
                "Value": [1]
            },
            "00660016": {
                "vr": "OF",
                "InlineBinary": encodedCoordinates
            },
            "0066002F": { "vr": "SQ" },
            "00660030": { "vr": "SQ" },
            "006A0003": {
                "vr": "UI",
                "Value": [generateGroupID()]
            },
            "006A0005": { "vr": "LO", "Value": ["Combined Polyline Group"] },
            "006A0007": { "vr": "CS", "Value": ["MANUAL"] },
            "006A0009": {
                "vr": "SQ",
                "Value": [
                    {
                        "00080100": {
                            "vr": "SH",
                            "Value": ["2681000"]
                        },
                        "00080102": {
                            "vr": "SH",
                            "Value": ["SCT"]
                        },
                        "00080104": {
                            "vr": "LO",
                            "Value": ["Anatomical Structure"]
                        }
                    }
                ]
            },
            "006A000A": {
                "vr": "SQ",
                "Value": [
                    {
                        "00080100": {
                            "vr": "SH",
                            "Value": ["98790000"]
                        },
                        "00080102": {
                            "vr": "SH",
                            "Value": ["SCT"]
                        },
                        "00080104": {
                            "vr": "LO",
                            "Value": ["Nucleus"]
                        }
                    }
                ]
            },
            "006A000C": { "vr": "UL", "Value": [1] },
            "006A000D": { "vr": "CS", "Value": ["YES"] },
            "00700023": { "vr": "CS", "Value": ["POLYLINE"] },
            "00660040": {
                "vr": "OL",
                "InlineBinary": encodedIndex
            }
        };

        combinedResponses.push(polylineDicomObject);
    }

    // Handle POLYGON separately, combining all POLYGON coordinates into a single DICOM object
    if (polygonCoordinates.length > 0) {
        const encodedCoordinates = getEncodedData(polygonCoordinates);
        const encodedIndex = getEncodedIndex(polygonIndexDict);

        let polygonDicomObject = {
            "0040A180": {
                "vr": "US",
                "Value": [1]
            },
            "00660016": {
                "vr": "OF",
                "InlineBinary": encodedCoordinates
            },
            "0066002F": { "vr": "SQ" },
            "00660030": { "vr": "SQ" },
            "006A0003": {
                "vr": "UI",
                "Value": [generateGroupID()]
            },
            "006A0005": { "vr": "LO", "Value": ["Combined Polygon Group"] },
            "006A0007": { "vr": "CS", "Value": ["MANUAL"] },
            "006A0009": {
                "vr": "SQ",
                "Value": [
                    {
                        "00080100": {
                            "vr": "SH",
                            "Value": ["2681000"]
                        },
                        "00080102": {
                            "vr": "SH",
                            "Value": ["SCT"]
                        },
                        "00080104": {
                            "vr": "LO",
                            "Value": ["Anatomical Structure"]
                        }
                    }
                ]
            },
            "006A000A": {
                "vr": "SQ",
                "Value": [
                    {
                        "00080100": {
                            "vr": "SH",
                            "Value": ["98790000"]
                        },
                        "00080102": {
                            "vr": "SH",
                            "Value": ["SCT"]
                        },
                        "00080104": {
                            "vr": "LO",
                            "Value": ["Nucleus"]
                        }
                    }
                ]
            },
            "006A000C": { "vr": "UL", "Value": [1] },
            "006A000D": { "vr": "CS", "Value": ["YES"] },
            "00700023": { "vr": "CS", "Value": ["POLYGON"] },
            "00660040": {
                "vr": "OL",
                "InlineBinary": encodedIndex
            }
        };

        combinedResponses.push(polygonDicomObject);
    }

    return combinedResponses;
};

// Function to encode index dictionary to Base64
const getEncodedIndex = (indexDict) => {
    let byteArray = new Uint8Array(Object.keys(indexDict).length * 4);
    let byteIndex = 0;
    Object.values(indexDict).forEach(index => {
        const indexBytes = new Uint32Array([index]);
        byteArray.set(new Uint8Array(indexBytes.buffer), byteIndex);
        byteIndex += 4;
    });
    return base64.fromByteArray(byteArray);
};


import {fileURLToPath} from 'url';
import {exec} from 'child_process';


// 将 import.meta.url 转换为文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'Upload'); // 移除了前面的斜杠


function convertJsonToDicom(jsonFilePath, outputDir) {
    return new Promise((resolve, reject) => {
        // 构造 DICOM 文件路径
        const dicomFileName = path.basename(jsonFilePath, '.json') + '.dcm';
        const dicomFilePath = path.join(outputDir, dicomFileName);

        // 构建转换命令
        const command = `json2dcm -j "${jsonFilePath}" -o "${dicomFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing json2dcm: ${error}`);
                return reject(error);
            }
            console.log(`DICOM file created: ${dicomFilePath}`);
            resolve(dicomFilePath);
        });
    });
}

// 确保目录存在
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true}); // 添加 { recursive: true } 以确保父目录被创建
}

function generateFileName() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log(timestamp);
    return `template_${timestamp}.json`;
}

const dicomOutputDir = path.join(__dirname, 'DicomFiles');
// 确保 DICOM 文件的输出目录存在
if (!fs.existsSync(dicomOutputDir)) {
    fs.mkdirSync(dicomOutputDir, {recursive: true});
}

async function saveTemplate(template) {
    const fileName = generateFileName();
    const jsonFilePath = path.join(uploadDir, fileName);
    const templateJSON = JSON.stringify(template, null, 2);
    try {
        await fs.promises.writeFile(jsonFilePath, templateJSON);
        console.log(`Template saved to ${jsonFilePath}`);

        await convertJsonToDicom(jsonFilePath, dicomOutputDir)
            .then(dicomFilePath => {
                return uploadDicomFile(dicomFilePath);
            })
            .then(dicomFilePath => {
                console.log(`Successfully uploaded DICOM file: ${dicomFilePath}`);
            })
            .catch(error => {
                console.error(`Error in converting or uploading DICOM file: ${error}`);
            });

    } catch (error) {
        console.error('Error in process:', error);
        throw error;
    }
}

import FormData from 'form-data';

async function uploadDicomFile(dicomFilePath) {
    try {
        const formData = new FormData();
        formData.append('Flies', fs.createReadStream(dicomFilePath));

        const response = await axios.post('https://ditto.dicom.tw/dicom-web/studies', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        console.log(`DICOM file uploaded: ${dicomFilePath}`);
        console.log(response.data); // 输出详细信息
        return dicomFilePath;
    } catch (error) {
        console.error(`Error uploading DICOM file: ${error}`);
        throw error;
    }
}

router.post('/SaveAnnData/studies/:studies/series/:series', async (req, res) => {
    const {studies, series} = req.params;

    try {
        // const data = fs.readFileSync('output11_modified.json', 'utf8');
        // const jsonData = JSON.parse(data);
        // const convertBase64Response = convertBase64(jsonData.data);
        //
        console.log(req.body.data);
        const convertBase64Response = convertBase64(req.body.data); // 改為 req.body.data

        const metadata = await fetchMetadata(studies, series);

        const getCurrentOID = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `2.16.886.111.100513.6826.${year}${month}${day}${hours}${minutes}${seconds}`;
        };
        //console.log(req.body)



        const condition = metadata["00080060"].value.Value[0] === "SM";

        const newSeriesUID = condition ? {
            "vr": "UI",
            "Value": [
                getCurrentOID()
            ]
        } : metadata["0020000E"].value;



        const template = {
            "00020001": {
                "vr": "OB",
                "InlineBinary": "AAE="
            },
            "00020002": {
                "vr": "UI",
                "Value": [
                    "1.2.840.10008.5.1.4.1.1.91.1"
                ]
            },
            "00020003": {
                "vr": "UI",
                "Value": [
                    getCurrentOID()
                ]
            },
            "00020010": {
                "vr": "UI",
                "Value": [
                    "1.2.840.10008.1.2.1"
                ]
            },
            "00020012": {
                "vr": "UI",
                "Value": [
                    "2.16.886.111.100006.100029.92583"
                ]
            },
            "00020013": {
                "vr": "SH",
                "Value": [
                    "PYDICOM 2.2.2"
                ]
            },
            ...(metadata["00200052"] && metadata["00200052"].value ? {
                "00200052": metadata["00200052"].value
            } : {}),

            "00200060": {
                "vr": "CS",
                "Value": [
                    "R"
                ]
            },
            "00080016": {
                "vr": "UI",
                "Value": [
                    "1.2.840.10008.5.1.4.1.1.91.1"
                ]
            },
            "00080018": {
                "vr": "UI",
                "Value": [
                    getCurrentOID()
                ]
            },
            "00080020": metadata["00080020"].value,
            "00080023": {
                "vr": "DA",
                "Value": [
                    "20181003"
                ]
            },
            "00080030": metadata["00080030"].value,
            "00080033": {
                "vr": "TM",
                "Value": [
                    "141016.791188"
                ]
            },

            "00080050":  {
                "vr": "SH",
                "Value": [
                    "FIVE"
                ]
            },

            "00080060": {
                "vr": "CS",
                "Value": [
                    "ANN"
                ]
            },
            "00080070": {
                "vr": "LO",
                "Value": [
                    "CyLab NTUNHS"
                ]
            },
            ...(metadata["00080090"] && metadata["00080090"].value ? {
                "00080090": metadata["00080090"].value
            } : {}),

            "00081090": {
                "vr": "LO",
                "Value": [
                    "CyLab NTUNHS"
                ]
            },
            "00081115": {
                "vr": "SQ",
                "Value": [
                    {
                        "0008114A": {
                            "vr": "SQ",
                            "Value": [
                                {
                                    "00081150": metadata["00080016"].value,
                                    "00081155": {
                                        "vr": "UI",
                                        "Value": [
                                            req.body.totalPixelMatrixColumns
                                        ]
                                    }
                                }
                            ]
                        },
                        "0020000E": metadata["0020000E"].value
                    }
                ]
            },
            "00081140": {
                "vr": "SQ",
                "Value": [
                    {
                        "00081150": metadata["00080016"].value,
                        "00081155": {
                            "vr": "UI",
                            "Value": [
                                req.body.totalPixelMatrixColumns
                            ]
                        }
                    }
                ]
            },
            "00100010": metadata["00100010"].value,
            "00100020": metadata["00100020"].value,
            "00100030": metadata["00100030"].value,
            "00100040": metadata["00100040"].value,
            "00181000": {
                "vr": "LO",
                "Value": [
                    "1"
                ]
            },
            "00181020": {
                "vr": "LO",
                "Value": [
                    "1"
                ]
            },
            "0020000D": metadata["0020000D"].value,
            "0020000E": newSeriesUID,
            "00200010": {
                "vr": "SH",
                "Value": [1]
            },

            ...(metadata["00200011"] && metadata["00200011"].value ? {
                "00200011": metadata["00200011"].value
            } : {}),
            ...(metadata["00200013"] && metadata["00200013"].value ? {
                "00200013": metadata["00200013"].value
            } : {}),
            "00480301": {
                "vr": "CS",
                "Value": [
                    "VOLUME"
                ]
            },
            "006A0001": {
                "vr": "CS",
                "Value": [
                    "2D"
                ]
            },
            "006A0002": {
                "vr": "SQ",
                "Value": convertBase64Response
            },
            "00700080": {
                "vr": "CS",
                "Value": [
                    "SM"
                ]
            },
            "00700081": {
                "vr": "LO",
                "Value": [
                    "SM_ANN"
                ]
            }
        };

        await saveTemplate(template);
        res.json(template);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch metadata or convert Base64'});
        console.error(error);
    }
});

router.post('/color', (req, res) => {
    const inputData = req.body;

    if (inputData.data && Array.isArray(inputData.data)) {
        const item = inputData.data[0]; // 假設只處理第一個 item
        if (item.color && item.color.length === 3) {
            const [L, a, b] = item.color;

            const L16 = Math.round((L / 100) * 0xFFFF);
            const a16 = Math.round(((a + 128) / 255) * 0xFFFF);
            const b16 = Math.round(((b + 128) / 255) * 0xFFFF);

            const dicomTag = {
                "0062000D": {
                    "vr": "US",
                    "Value": [L16, a16, b16]
                }
            };

            res.json(dicomTag);
        } else {
            res.status(400).json({ error: 'Invalid color format' });
        }
    } else {
        res.status(400).json({ error: 'Invalid input format' });
    }
});



export default router;