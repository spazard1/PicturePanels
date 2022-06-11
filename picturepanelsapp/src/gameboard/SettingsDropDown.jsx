import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { putTogglePauseGame } from "../common/putTogglePauseGame";
import { useLocalStorageState } from "../common/useLocalStorageState";

import "./SettingsDropDown.css";

const SettingsDropDown = ({ gameStateId, pauseState }) => {
  const [volume, setVolume] = useLocalStorageState("volume", 50);
  const onTogglePauseGame = () => {
    putTogglePauseGame(gameStateId, () => {});
  };

  return (
    <DropdownButton className="settingsButton" variant={"secondary"} title="⚙" size="sm" menuVariant="dark">
      <Dropdown.Item onClick={onTogglePauseGame}>{pauseState === "Paused" ? "Resume Game" : "Pause Game"}</Dropdown.Item>
      <Dropdown.Item>
        <div className="volume-chooser">
          <div className="volume-button">
            <span>&#128266;</span>
            <span className="volume-value">{volume}</span>
          </div>
          <div>
            <input className="volume" type="range" min={1} max={100} value={volume} onChange={(e) => setVolume(e.target.value)} />
          </div>
        </div>
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default SettingsDropDown;

SettingsDropDown.propTypes = {
  gameStateId: PropTypes.string,
  pauseState: PropTypes.string,
};
