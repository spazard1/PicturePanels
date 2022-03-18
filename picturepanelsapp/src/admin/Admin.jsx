import React from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import "./Admin.css";

export default function Admin() {
  useBodyClass("admin");

  return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Admin</h2>
      <AllLinks />
    </main>
  );
}
