import React from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import './Upload.css';

export default function Upload() {
  useBodyClass("upload");

  return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Upload</h2>
      <AllLinks/>
    </main>
  );
}
