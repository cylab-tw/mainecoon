<h1>Mainecoon Web-based Digital Pathology Viewer</h1>
<p><strong>Mainecoon</strong> is a browser-based whole slide image (WSI) viewer is primarily maintained by the <a href="https://cylab.dicom.tw/">Imaging Informatics Labs</a>. It is a pure single-page application (SPA), lightweight, and using only JavaScript and HTML5 technologies so as to deploy it on any HTTP server easily (just put it in HTTP server). It supports rendering DICOM WSI as well asd its annotation encoded ANN which is a new DICOM object to display annotation on a WSI. Mainecoon supports  to connect to medical image archives which support <a href="https://www.dicomstandard.org/dicomweb/">DICOMweb</a>.

<a href="https://cylab-tw.github.io/mainecoon/search/html/start.html"><strong>Live DEMO</strong></a>&ensp;&ensp;&ensp;

<a href="https://mainecoon.dicom.tw/"><strong>Live DEMO (New Version)</strong></a>&ensp;&ensp;&ensp;

<a href="https://mainecoon.dicom.tw/#/WSIViwerByStudy/1.3.46.670589.45.1.1.4993912214784.1.5436.1538560373543"><strong>Live DEMO (With Only StudyInstanceUID_Amy)</strong></a>&ensp;&ensp;&ensp;
<a href="https://mainecoon.dicom.tw/#/WSIViwerByStudy/2.16.840.1.113995.3.110.3.0.10118.2000002.278819.649182"><strong>Live DEMO (With Only StudyInstanceUID_Roche)</strong></a>&ensp;&ensp;&ensp;

## Install
* Put all files into any directory in the static directory on any HTTP server.

## DICOMWeb Configuration
* go to `./bluelight-WSI/data/config.json` and change the configuration of DICOM server.
 - **Reminder** the DICOMWeb Plugin of the DICOM server shall be installed first. 
 
## Key Features
### Network support
* Integration with any DICOMWeb Image Archive, including Orthanc, and dcm4chee server

### 2D image interpretation
* Pan, zoom, move
* Scroll images within a series
* Line and angle measurement
* hide/display markups and annotations

### supported the display of the kinds of markups and annotations
* ANN: [Supplement 222: Microscopy Bulk Simple Annotations Storage SOP Class](https://www.dicomstandard.org/news-dir/progress/docs/sups/sup222.pdf)

## Supported library
* BlueLight Viewer uses several oepn source libraries as folowing:
  - <a href="https://github.com/taye/interact.js">OpenSeadragon</a> for move, zoom, switch series.
  - <a href="https://github.com/cornerstonejs">cornerstone</a> for reading, parsing DICOM-formatted data.
  - <a href="https://github.com/cornerstonejs/dicomParser">dicomParser</a> for parsing DICOM tags.
  
* **Mainecoon@micala**: [micala](https://tony880321.github.io/micala_SIIM/) participated in SIIM 2022 Hackathon.
