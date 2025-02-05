<p align="left">
  <img src="./src/assests/mainecoon.png" height="100" width="120" alt="" />
</p>

# Mainecoon

Mainecoon is a powerful web-based digital pathology viewer designed for researchers, pathologists, and healthcare professionals to explore and analyze pathology images directly in the browser. 

<a href="https://ditto-wsiviewer.dicom.tw/search"><strong>Live DEMO</strong></a>&ensp;&ensp;&ensp;

## Demo Videos
* [Video - Introduction](https://youtu.be/gc052S9UCdE)
* [Video - Rendering for large bulk annotations](https://youtu.be/_XCYwVXTWBg)
* [Video - Display the DICOM WG26 Connectathon 2024 Dataset](https://youtu.be/VywV2bSM6NM)

## About
- Mainecoon features a user-friendly interface with full support for responsive web design (RWD), eliminating the need for additional software installation.
- Provides five annotation tools, including "point, polyline, polygon, ellipse, and rectangle"
- Validated the "Evidence Creator" and "Viewer" actors in the 2024 DICOM WG26 Connectathon, enabling the creating annotations, is compliant with DICOM standards, featuring Microscopy Bulk Simple Annotations (also called ANN)

## Key Features
### Network support
* Integration with any DICOMweb image archive, including Raccoon, Orthanc, and dcm4chee server
  - Retrieve methods: WADO-URL and WADO-RS
  - Store annotations: STOW-RS
### Authentication: OAuth2
* OAuth2 - Enable the OAuth2 to modify the [oauthConfig.json](/public/oauthConfig.json)
   - **Note:** We used Keycloak to test the function of OAuth2.
### Viewer
- **Whole Slide Image (WSI) Viewer**: Display WSIs using efficient tiling and progressive loading techniques.
- **Annotation Support**: Create and manage annotations of graphic types defined in the DICOM [Microscopy Bulk Simple Annotations Module](https://dicom.nema.org/medical/dicom/2023a/output/chtml/part03/sect_C.37.html) for precise image labeling and analysis. Annotations can be stored via STOW-RS on the connected DICOMweb server.
- **Advanced Image Interaction**: Pan, zoom, and rotate multi-layer images through OpenLayers for detailed analysis.

## Installation
Before starting, ensure you have configured the environment variables as needed. See the [DICOMweb Server Configuration](#dicomweb-server-configuration)
 section for more information.

### Docker
To quickly start Mainecoon using Docker:

```bash
docker compose up -d
```

### Build from source

#### Dependencies

To run Mainecoon from the source, ensure you have the following installed:

- Node.js (v18.18 or later)
- npm

#### Building

Install the dependencies and build the project:

```bash
npm install
npm run build
```

#### Running

```bash
node .\app\server.js
```

The viewer should now be accessible at [http://localhost:3000](http://localhost:3000).

## DICOMweb Server Configuration

To set up the DICOMweb Server, make changes to the following file:
[.src/config/DICOMWebServer.config.js](./src/config/DICOMWebServer.config.js)


### DICOMweb Server Configuration Example

This configuration file is to configure the DICOMweb server details for different environments.

```javascript
export default {
  SERVER_NAME: {
    QIDO: {
      enableHTTPS: true,
      hostname: "your.server.com",
      port: "",
      pathname: "/dicom-web",
      Token: null,
    },
    WADO: {
      enableHTTPS: true,
      hostname: "your.server.com",
      port: "",
      URI_pathname: "/dicom-web/wado",
      RS_pathname: "/dicom-web",
      Mode: "rs",
      Token: null,
    }
  }
}
```

### Environment Variables

The following variables are used to configure the runtime settings:

- `PORT`: The port number the server listens on (default: `3000`).

### Roadmap
* Support for ICC Profile display to ensure accurate color representation.
* Support displaying JPEG2000 Lossless compression via WADO-RS option: image/jp2.
* Support displaying the comprehensive 3D DICOM SR.
* Support displaying additional DICOM annotation types including parametric maps, saliency maps, and segmentation.

# Acknowledgement
* To acknowledge the Mainecoon in an academic publication, please cite "release soon".
* This project was supported by grants from the Ministry of Science and Technology Taiwan.
* We acknowledge H99 teams at Taipei Veterans General Hospital (TVGH) and the [Smile Lab](http://smile.ee.ncku.edu.tw) at National Cheng Kung University for validation.
* Dr.Yi-Chen Yeh from the Department of Pathology and Laboratory Medicine TVGH, provides many useful suggestions in many aspects of the clinical domain.

## License
This project is licensed under the [MIT License](./LICENSE).
