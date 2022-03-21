import React from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";

import "./Panels.css";

const panelNumbers = [...Array(20).keys()].map(
  (panelNumber) => panelNumber + 1
);

export default function Panels({ revealedPanels }) {
  console.log(revealedPanels);

  return (
    <div id="panels" className="panels center">
      {panelNumbers.map((panelNumber) => (
        <>
          {revealedPanels.indexOf(panelNumber) >= 0 && (
            <Panel
              className={"isOpen"}
              key={panelNumber}
              panelNumber={panelNumber}
            ></Panel>
          )}
          {revealedPanels.indexOf(panelNumber) < 0 && (
            <Panel key={panelNumber} panelNumber={panelNumber}></Panel>
          )}
        </>
      ))}
    </div>
  );
}

Panels.propTypes = {
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
};
