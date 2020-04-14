<h1>BlueLight Web-based DICOM Viewer (BuleLight Viewer)</h1>
<p><strong>Blue Light</strong> is a browser-based medical image viewer is primarily maintained by the <a href="https://cylab.dicom.org.tw/">Imaging Informatics Labs</a>. It is a pure single-page application (SPA), lightweight, and using only JavaScript and HTML5 technologies so as to deploy it on any HTTP server easily (just put it in HTTP server). It supports not only opening local data, but also connecting to medical image archives which support <a href="https://www.dicomstandard.org/dicomweb/">DICOMweb</a>. It can display the various image markups and annotations such as Annotation and Image Markup (AIM), DICOM-RT structure set (RTSS), DICOM Overlay, and DICOM Presentation State. It provides tools for medical image interpretation and 3D image reconstruction, e.g., Multiplanar Rreformation or Reconstruction (MPR) and Volume Rendering (VR).</p>

## About
* 本專案擁有平易近人的操作介面以及全球獨一無二的CSS 3D VR渲染系統。並支援RWD及Web零足跡瀏覽，可在任意大小的裝置上執行。
* 標記方面支援RTSS、Overlay、Graphic Annotation、AIM等標記，亦可於3D系統中專換成3D標記。
* 3D VR顯示模式支援染色、降噪、打光、挖洞，MPR模式則支援內插、染色以及切面的顯示。

## Key Features
### Network support
* load local files
* Integration with any DICOMWeb Image Archive, including Orthanc, and dcm4chee server
* Integration with XNAT (currently doesn't build as an XNAT plugin)

### 2D image interpretation
* Pan, zoom, move
* Scroll images within a series
* Rotation, Flip, Invert
* Windowing
* Cine
* viewports:  1×1, 1×2,2×1 and 2×2
* Cross-Studies synchronization
* Magnifier, etc
* Line and angle measurement
* hide/display markups and annotations

### supported markups and annotations
* DICOM Graphic Annotation
* DICOM Overlay
* DICOM-RT structure set (RTSS)
* Annotation and Image Markup (AIM)

### 3D Post-Processing
* MPR (Multiplanar Reconstruction)
* 3D Volume Rendering 

## Supported library
* BuleLight Viewer uses several oepn source libraries as folowing:
  - <a href="https://github.com/cornerstonejs">cornerstone</a> for reading, parsing DICOM-formatted data.
  - <a href="https://github.com/cornerstonejs/dicomParser">dicomParser</a> for parsing DICOM tags.
  - <a href="https://github.com/cornerstonejs/cornerstoneTools">cornerstoneTools</a> for performing windowing operation.
  - <a href="https://github.com/cornerstonejs/cornerstoneWADOImageLoader">cornerstoneWADOImageLoader</a> for communicating with the DICOMWeb servers such as  <a href="https://www.orthanc-server.com">Orthanc</a> and <a href="https://www.dcm4che.org">Dcm4chee</a> 
 
## Special projects
* **BuleLight@XANT**
* **BuleLight@Orthanc**
* **BuleLight@micala**: [micala](https://github.com/cylab-tw/micala) is a noSQL-based medical image repository.

## Copyright Chung-Yueh Lien
