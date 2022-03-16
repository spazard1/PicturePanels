import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

const Player = lazy(() => import('./routes/player'));
const Gameboard = lazy(() => import('./routes/gameboard'));

ReactDOM.render(
  <BrowserRouter>
    <Suspense fallback={<div></div>}>
      <Routes>
        <Route path="/" element={<Player />} />
        <Route path="gameboard" element={<Gameboard />} />

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
