import React, { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";
import MostVotesPanels from "./MostVotesPanels";
import usePrevious from "../common/usePrevious";
import { GetEntranceClass } from "../animate/Animate";
import PlayerDots from "./PlayerDots";
import "./Panels.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

const Panels = ({ gameStateId, players, revealedPanels, roundNumber, teamTurn, turnType, teamIsCorrect }) => {
  const panelsRef = useRef();
  const [entranceClass, setEntranceClass] = useState("");
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const previousRevealedPanels = usePrevious(revealedPanels);
  const panelRefs = useMemo(() => panelNumbers.map(() => React.createRef()), []);

  useEffect(() => {
    if (!previousRevealedPanels || revealedPanels.length < previousRevealedPanels.length) {
      setEntranceClass(GetEntranceClass());
    }
  }, [previousRevealedPanels, revealedPanels]);

  useEffect(() => {
    if (Object.keys(imagesLoaded).length === panelNumbers.length) {
      resizePanelContainer();
      setAllImagesLoaded(true);
    }
  }, [imagesLoaded]);

  useEffect(() => {
    setImagesLoaded({});
    setAllImagesLoaded(false);
  }, [gameStateId, roundNumber]);

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    window.onresize = resizePanelContainer;

    resizePanelContainer();
  }, [roundNumber, gameStateId]);

  const resizePanelContainer = () => {
    var panelsContainerRect = panelsRef.current.getBoundingClientRect();
    var panelsContainerMaxWidth = 84;
    panelsRef.current.style.maxWidth = panelsContainerMaxWidth + "vw";
    var paddingBottom = 5;

    while (panelsContainerRect.height + panelsContainerRect.y >= window.innerHeight - paddingBottom) {
      panelsContainerMaxWidth -= 0.5;
      if (panelsContainerMaxWidth < 10) {
        break;
      }

      panelsRef.current.style.maxWidth = panelsContainerMaxWidth + "vw";
      panelsContainerRect = panelsRef.current.getBoundingClientRect();
    }
  };

  return (
    <>
      <div ref={panelsRef} id="panels" className="panels center">
        {panelNumbers.map((panelNumber) => (
          <Panel
            key={panelNumber}
            ref={panelRefs[panelNumber - 1]}
            gameStateId={gameStateId}
            isOpen={turnType === "EndRound" || teamIsCorrect || revealedPanels.indexOf(panelNumber) >= 0}
            entranceClass={entranceClass}
            panelNumber={panelNumber}
            roundNumber={roundNumber}
            setImagesLoaded={setImagesLoaded}
          ></Panel>
        ))}
      </div>
      {allImagesLoaded && <MostVotesPanels panelRefs={panelRefs} players={players} teamTurn={teamTurn} turnType={turnType}></MostVotesPanels>}
      {allImagesLoaded && <PlayerDots panelRefs={panelRefs} players={players} teamTurn={teamTurn} turnType={turnType}></PlayerDots>}
    </>
  );
};

export default React.memo(Panels);

Panels.propTypes = {
  gameStateId: PropTypes.string,
  players: PropTypes.object,
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
  roundNumber: PropTypes.number,
  teamTurn: PropTypes.number,
  turnType: PropTypes.string,
  teamIsCorrect: PropTypes.bool,
};
