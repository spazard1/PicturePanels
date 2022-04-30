import { useCallback, useContext, useEffect, useState } from "react";
import { useSignalR } from "../../signalr/useSignalR";
import getChats from "./getChats";
import SignalRConnectionContext from "../../signalr/SignalRConnectionContext";
import { throttle } from "throttle-debounce";

export function useChats(gameStateId, playerId, teamNumber, onLoading) {
  const { connection } = useContext(SignalRConnectionContext);
  const [chats, setChats] = useState([]);
  const [playersTyping, setPlayersTyping] = useState({});

  const connectionId = useSignalR("Chat", (chat) => {
    setChats((cs) => [...cs, chat]);

    setPlayersTyping((pt) => {
      const newPlayersTyping = { ...pt };
      delete newPlayersTyping[chat.player.playerId];
      return newPlayersTyping;
    });
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

  const invokeSendTyping = () => {
    if (!connection) {
      return;
    }

    if (connection.state !== "Connected") {
      return;
    }

    connection.invoke("Typing", {
      gameStateId: gameStateId,
      playerId: playerId,
    });
  };

  const typingIndicatorTime = 6000;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sendTyping = useCallback(throttle(typingIndicatorTime, invokeSendTyping), [connection]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schedulePlayersTypingUpdate = useCallback(
    throttle(1000, () => {
      setTimeout(() => {
        setPlayersTyping((pt) => {
          const newPlayersTyping = { ...pt };

          for (const playerId in newPlayersTyping) {
            if (new Date() - newPlayersTyping[playerId].typingTime >= typingIndicatorTime) {
              delete newPlayersTyping[playerId];
            }
          }
          return newPlayersTyping;
        });
      }, typingIndicatorTime);
    }),
    []
  );

  useSignalR("Typing", (player) => {
    if (player.playerId === playerId) {
      return;
    }

    setPlayersTyping((pt) => {
      return { ...pt, [player.playerId]: { ...player, typingTime: new Date() } };
    });
    schedulePlayersTypingUpdate();
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

  return { chats, playersTyping, sendChat, sendTyping };
}
