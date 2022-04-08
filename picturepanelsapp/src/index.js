import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./themes/default/default.css";
import AppWrapper from "./common/AppWrapper";

const container = document.getElementById("root");
const root = createRoot(container);

const Player = lazy(() => import("./player/Player"));
const Gameboard = lazy(() => import("./gameboard/Gameboard"));
const Upload = lazy(() => import("./upload/Upload"));
const Admin = lazy(() => import("./admin/Admin"));

root.render(
  <AppWrapper>
    <BrowserRouter>
      <Suspense fallback={<div></div>}>
        <Routes>
          <Route path="/" element={<Player />} />
          <Route path="gameboard" element={<Gameboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="admin" element={<Admin />} />

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AppWrapper>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
