import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import './index.css';

const Player = lazy(() => import('./Player/Player'));
const Gameboard = lazy(() => import('./Gameboard/Gameboard'));
const Upload = lazy(() => import('./Upload/Upload'));
const Admin = lazy(() => import('./Admin/Admin'));

ReactDOM.render(
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
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
