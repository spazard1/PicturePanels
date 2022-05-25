import React, { useState } from "react";
import PropTypes from "prop-types";

import "./ChooseTeam.css";
import getSmallestTeam from "./getSmallestTeam";
import { Button } from "react-bootstrap";

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
        <div className="chooseSmallestTeamContainer">
          <Button className={"chooseTeamNameButton"} variant="info" disabled={isLoading} onClick={chooseSmallestTeamOnClick}>
            {isLoading ? "Loading..." : "Choose for me"}
          </Button>
        </div>
        {!isLoading && (
          <>
            <div>
              <Button className={"chooseTeamNameButton"} variant="primary" disabled={isLoading} onClick={() => onTeamNumberClick(1)}>
                {teamOneName}
              </Button>
            </div>
            <div>
              <Button className={"chooseTeamNameButton"} variant="danger" disabled={isLoading} onClick={() => onTeamNumberClick(2)}>
                {teamTwoName}
              </Button>
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
