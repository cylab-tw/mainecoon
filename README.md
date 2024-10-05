<p align="left">
  <img src="./src/assests/mainecoon.png" height="100" width="120" alt="" />
</p>

# Mainecoon

Mainecoon is a powerful web-based digital pathology viewer, designed to allow researchers, pathologists, and healthcare professionals to explore and analyze pathology images directly in the browser. This project builds upon the original [cylab-tw/mainecoon](https://github.com/cylab-tw/mainecoon) and evolves to meet modern medical imaging needs.

## About

- MaineCoon features a user-friendly interface with full support for responsive web design (RWD), eliminating the need for additional software installation.
- Provides five annotation tools, including "point, polyline, polygon, ellipse and rectangle"
- Passed the "Creator" and "Viewer" roles in the 2024 ECDP Annotation Connectathon, enabling the creation of annotations in the DICOM standard format.

## Features

- **Whole Slide Image (WSI) Viewer**: Display pathology images using efficient tiling and progressive loading techniques.
- **DICOMweb Compliance**: Integrate with DICOMweb for seamless image rendering and annotation support.
- **Annotation Support**: Create and manage annotations of graphic types defined in the DICOM [Graphic Annotation Module](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.10.5.html) for precise image labeling and analysis. Annotations can be stored to the connected DICOMweb server.
- **Advanced Image Interaction**: Pan, zoom, and rotate multi-layer images through OpenLayers for detailed analysis.

## Installation

Before starting, ensure you have configured the environment variables as needed. See the [Configuration](#configuration) section for more information.

### Docker

To quickly start Mainecoon using Docker:

```bash
docker compose up -d
```

### Build from source

#### Dependencies

To run Mainecoon from source, ensure you have the following installed:

- Node.js (v18.18 or later)
- npm

#### Building

Install the dependencies and build the project:

```bash
npm install
npm run build
```

Copy static assets to build output directory:

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
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

This configuration file is used to set up the DICOMweb Server details for different environments.

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

## License

This project is licensed under the [MIT License](./LICENSE).
