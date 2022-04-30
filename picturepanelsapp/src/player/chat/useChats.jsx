import { useContext, useEffect, useState } from "react";
import { useSignalR } from "../../signalr/useSignalR";
import getChats from "./getChats";
import SignalRConnectionContext from "../../signalr/SignalRConnectionContext";

export function useChats(gameStateId, playerId, teamNumber, onLoading) {
  const { connection } = useContext(SignalRConnectionContext);
  const [chats, setChats] = useState([]);
  const [playersTyping, setPlayersTyping] = useState({});

  const connectionId = useSignalR("Chat", (chat) => {
    setChats((cs) => [...cs, chat]);
  });

  const sendChat = (message) => {
    if (!connection) {
      return;
    }

    if (connection.state !== "Connected") {
      return;
    }

    connection.invoke(
      "Chat",
      {
        gameStateId: gameStateId,
        playerId: playerId,
      },
      message
    );

    setChats((cs) => [...cs, { ticks: new Date().getTime(), message: message, player: { playerId: playerId } }]);
  };

  useSignalR("Typing", (player) => {
    setPlayersTyping((pt) => {
      return { ...pt, [player.playerId]: { player: player, typingTime: new Date() } };
    });
  });

  useEffect(() => {
    if (!gameStateId || !teamNumber || !connectionId) {
      return;
    }

    onLoading(true);
    getChats(gameStateId, teamNumber, (cs) => {
      onLoading(false);
      if (!cs) {
        return;
      }

      setChats(cs);
    });
  }, [gameStateId, teamNumber, onLoading, connectionId]);

  return { chats, playersTyping, sendChat };
}
