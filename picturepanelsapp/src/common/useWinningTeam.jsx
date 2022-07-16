import { useEffect, useState } from "react";

export function useWinningTeam(gameState, player) {
  const [winningTeam, setWinningTeam] = useState();
  const [isWinner, setIsWinner] = useState();

  useEffect(() => {
    if (gameState && gameState.turnType === "EndGame") {
      if (gameState.teamOneScore > gameState.teamTwoScore) {
        setWinningTeam(gameState.teamOneName);
        setIsWinner(player.teamNumber === 1);
      } else if (gameState.teamOneScore < gameState.teamTwoScore) {
        setWinningTeam(gameState.teamTwoName);
        setIsWinner(player.teamNumber === 2);
      } else {
        if (gameState.teamOneIncorrectGuesses < gameState.teamTwoIncorrectGuesses) {
          setWinningTeam(gameState.teamOneName);
          setIsWinner(player.teamNumber === 1);
        } else if (gameState.teamOneIncorrectGuesses > gameState.teamTwoIncorrectGuesses) {
          setWinningTeam(gameState.teamTwoName);
          setIsWinner(player.teamNumber === 2);
        } else {
          setWinningTeam("");
          setIsWinner(false);
        }
      }
    }
  }, [gameState, player]);

  return { winningTeam, isWinner };
}
