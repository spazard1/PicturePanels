import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { putTogglePauseGame } from "../common/putTogglePauseGame";

import "./SettingsDropDown.css";

const SettingsDropDown = ({ gameStateId, pauseState, volume, onChangeVolume }) => {
  const onTogglePauseGame = () => {
    putTogglePauseGame(gameStateId, () => {});
  };

  return (
    <DropdownButton className="settingsButton" variant={"secondary"} title="⚙" size="sm" menuVariant="dark" autoClose="outside">
      <Dropdown.Item onClick={onTogglePauseGame} disabled={!gameStateId}>
        {pauseState === "Paused" ? "Resume Game" : "Pause Game"}
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item>
        <div className="volume-chooser">
          <div className="volume-button">
            <span>&#128266;</span>
            <span className="volume-value">{volume}</span>
          </div>
          <div>
            <input className="volume" type="range" min={1} max={100} value={volume} onChange={(e) => onChangeVolume(parseInt(e.target.value))} />
          </div>
        </div>
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default React.memo(SettingsDropDown);

SettingsDropDown.propTypes = {
  gameStateId: PropTypes.string,
  pauseState: PropTypes.string,
  volume: PropTypes.number,
  onChangeVolume: PropTypes.func.isRequired,
};
