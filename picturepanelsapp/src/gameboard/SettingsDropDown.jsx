import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { putTogglePauseGame } from "../common/putTogglePauseGame";

import "./SettingsDropDown.css";

const SettingsDropDown = ({ gameStateId, pauseState }) => {
  const onTogglePauseGame = () => {
    putTogglePauseGame(gameStateId, () => {});
  };

  return (
    <DropdownButton className="settingsButton" variant={"secondary"} title="⚙" size="sm" menuVariant="dark">
      <Dropdown.Item onClick={onTogglePauseGame}>{pauseState === "Paused" ? "Resume Game" : "Pause Game"}</Dropdown.Item>
    </DropdownButton>
  );
};

export default SettingsDropDown;

SettingsDropDown.propTypes = {
  gameStateId: PropTypes.string,
  pauseState: PropTypes.string,
  hideRemainingTime: PropTypes.string,
  disableVibrate: PropTypes.string,
  onPlayerNameChange: PropTypes.func.isRequired,
  onTeamChange: PropTypes.func.isRequired,
  onToggleHideRemainingTime: PropTypes.func.isRequired,
  onToggleVibrate: PropTypes.func.isRequired,
};
