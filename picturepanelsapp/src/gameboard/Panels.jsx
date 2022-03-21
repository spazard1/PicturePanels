import React from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";

import "./Panels.css";
//import usePrevious from "../common/usePrevious";

const panelNumbers = [...Array(20).keys()].map(
  (panelNumber) => panelNumber + 1 + ""
);

export default function Panels({ revealedPanels, roundNumber }) {
  //const previousRevealedPanels = usePrevious(revealedPanels);

  return (
    <div id="panels" className="panels center">
      {panelNumbers.map((panelNumber) => {
        let classes = [];

        //if (previousRevealedPanels.length < revealedPanels.length) {
        //  classes.push("");
        //}

        return (
          <Panel
            isOpen={revealedPanels.indexOf(panelNumber) >= 0}
            animationClasses={classes}
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
