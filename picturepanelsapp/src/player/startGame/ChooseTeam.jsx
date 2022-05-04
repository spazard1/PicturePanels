import React, { useState } from "react";
import PropTypes from "prop-types";

import "./ChooseTeam.css";
import getSmallestTeam from "./getSmallestTeam";

const ChooseTeam = ({ gameStateId, teamOneName, teamTwoName, onTeamNumberSelect }) => {
  const [isLoading, setIsLoading] = useState(false);

  const chooseSmallestTeamOnClick = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    getSmallestTeam(gameStateId, (teamNumber) => {
      setIsLoading(false);
      if (teamNumber && teamNumber.teamNumber) {
        onTeamNumberSelect(teamNumber.teamNumber);
      } else {
        onTeamNumberSelect(false);
      }
    });
  };

  const onTeamNumberClick = (teamNumber) => {
    if (isLoading) {
      return;
    }
    onTeamNumberSelect(teamNumber);
  };

  return (
    <>
      <div className="chooseTeamLabel">Choose your team!</div>
      <div className="chooseTeamNames">
        <div className="chooseTeamName chooseSmallestTeam" onClick={chooseSmallestTeamOnClick}>
          {isLoading ? "Loading..." : "Choose for me"}
        </div>
        {!isLoading && (
          <>
            <div className="chooseTeamName teamOneBox" onClick={() => onTeamNumberClick(1)}>
              {teamOneName}
            </div>
            <div className="chooseTeamName teamTwoBox" onClick={() => onTeamNumberClick(2)}>
              {teamTwoName}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChooseTeam;

ChooseTeam.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  teamOneName: PropTypes.string.isRequired,
  teamTwoName: PropTypes.string.isRequired,
  onTeamNumberSelect: PropTypes.func.isRequired,
};
