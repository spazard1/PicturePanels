import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import "./index.css";
import "./themes/default/default.css";
import AppWrapper from "./common/AppWrapper";

const Player = lazy(() => import("./player/Player"));
const Gameboard = lazy(() => import("./gameboard/Gameboard"));
const Upload = lazy(() => import("./upload/Upload"));
const Admin = lazy(() => import("./admin/Admin"));

ReactDOM.render(
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
  </AppWrapper>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
