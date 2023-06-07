import React, { Children } from "react";
import type { RouteObject } from "react-router-dom";
import Home from "Pages/home";
import NotFound from "Pages/notFound";
import Main from "Pages/Main";

import WSIViewerOpenLayers from "Pages/WsiViewerOpenLayers";
import WSIViewerWithReport from "Pages/WsiViewerWithReport"

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Main />,
    children: [],
  },
  {
    path: "*",
    element: <NotFound />,
    children: [],
  },
  {
    path: "/home",
    element: <Home />,
    children: [],
  }, 
  {
    path: "/WSIViewerOpenLayers/:studyInstanceUID/:seriesInstanceUID/:modalityAttribute",
    element: <WSIViewerOpenLayers />,
    children: [],
  },
  {
    path: "/WSIViewerWithReport/:studyInstanceUID/:seriesInstanceUID/:modalityAttribute",
    element: <WSIViewerWithReport />,
    children: [],
  },
];

export default routes;
