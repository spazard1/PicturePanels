import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { putTogglePauseGame } from "../common/putTogglePauseGame";

import "./SettingsDropDown.css";

const SettingsDropDown = ({
  gameStateId,
  pauseState,
  hideRemainingTime,
  disableVibrate,
  onPlayerNameChange,
  onPlayerAvatarChange,
  onTeamChange,
  onToggleHideRemainingTime,
  onToggleVibrate,
}) => {
  const onTogglePauseGame = () => {
    putTogglePauseGame(gameStateId, () => {});
  };

  return (
    <DropdownButton className="settingsButton" variant={"secondary"} title="⚙" size="sm" menuVariant="dark">
      <Dropdown.Item onClick={onPlayerNameChange}>Change Name/Game</Dropdown.Item>
      <Dropdown.Item onClick={onPlayerAvatarChange}>Change Avatar</Dropdown.Item>
      <Dropdown.Item onClick={onTeamChange}>Change Team</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onToggleHideRemainingTime}>Show Remaining Time{hideRemainingTime ? "" : " ✓"}</Dropdown.Item>
      <Dropdown.Item onClick={onToggleVibrate}>Vibrations{disableVibrate ? "" : " ✓"}</Dropdown.Item>
      <Dropdown.Divider />
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
  onPlayerAvatarChange: PropTypes.func.isRequired,
  onTeamChange: PropTypes.func.isRequired,
  onToggleHideRemainingTime: PropTypes.func.isRequired,
  onToggleVibrate: PropTypes.func.isRequired,
};
