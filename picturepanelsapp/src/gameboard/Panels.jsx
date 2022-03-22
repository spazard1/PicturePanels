import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";
import usePrevious from "../common/usePrevious";
import { GetEntranceClass } from "../animate/Animate";
import "./Panels.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function Panels({ revealedPanels, roundNumber }) {
  const [entranceClass, setEntranceClass] = useState("");
  const previousRevealedPanels = usePrevious(revealedPanels);

  useEffect(() => {
    if (!previousRevealedPanels || revealedPanels.length < previousRevealedPanels.length) {
      setEntranceClass(GetEntranceClass());
    }
  }, [revealedPanels]);

  return (
    <div id="panels" className="panels center">
      {panelNumbers.map((panelNumber) => {
        return (
          <Panel
            isOpen={revealedPanels.indexOf(panelNumber) >= 0}
            entranceClass={entranceClass}
            key={panelNumber}
            panelNumber={panelNumber}
            roundNumber={roundNumber}
          ></Panel>
        );
      })}
    </div>
  );
}

Panels.propTypes = {
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
  roundNumber: PropTypes.number.isRequired,
};
