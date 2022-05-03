import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

import "./Chat.css";
import { useChats } from "./useChats";
import classNames from "classnames";

const Chat = ({ gameStateId, playerId, teamNumber, teamName }) => {
  const [chatInput, setChatInput] = useState();
  const chatsRef = useRef();
  const messagesEndRef = useRef();
  const firstLoadRef = useRef(true);
  const scrolledToBottom = useRef(false);
  const chatInputRef = useRef();

  const onLoading = useCallback(() => {}, []);
  const { chats, playersTyping, sendChat, sendTyping } = useChats(gameStateId, playerId, teamNumber, onLoading);

  const sendChatOnClick = () => {
    sendChat(chatInput);
    setChatInput("");
    scrollToBottom();
    chatInputRef.current.focus();
  };

  const onScroll = () => {
    if (chatsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatsRef.current;
      scrolledToBottom.current = scrollTop + clientHeight > scrollHeight - 3; // three pixel buffer
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current.scrollIntoView(), 0);
  };

  useEffect(() => {
    if (!chatInput) {
      return;
    }

    sendTyping();
  }, [sendTyping, chatInput]);

  useEffect(() => {
    if (!chats || chats.length === 0) {
      return;
    }

    if (firstLoadRef.current) {
      scrollToBottom();
      firstLoadRef.current = false;
      return;
    }

    if (scrolledToBottom.current) {
      scrollToBottom();
    }
  }, [chats]);

  useEffect(() => {
    window.onresize = () => {
      scrollToBottom();
    };
  }, []);

  const maxTypingPlayersDisplay = 3;

  return (
    <div className={"chatsContainer"}>
      <div onScroll={onScroll} ref={chatsRef} className="chats">
        {chats.map((chat) => (
          <div
            key={chat.ticks}
            className={classNames("chat", {
              selfChat: !chat.isSystem && chat.player && chat.player.playerId === playerId,
              othersChat: !chat.isSystem && chat.player && chat.player.playerId !== playerId,
              systemChat: chat.isSystem,
            })}
          >
            {chat.player && (chat.player.playerId !== playerId || chat.isSystem) && (
              <>
                <span style={{ color: chat.player.color }}>{chat.player.name}</span>
                {chat.isSystem ? " " : ": "}
              </>
            )}
            <span>{chat.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {Object.keys(playersTyping).length > 0 && (
        <div className="chat othersChat">
          {Object.values(playersTyping).map((player, i) => (
            <span key={player.playerId}>
              {i > 0 && i < maxTypingPlayersDisplay && <span>, </span>}
              {i < maxTypingPlayersDisplay && <span style={{ color: player.color }}>{player.name}</span>}
              {i === maxTypingPlayersDisplay && (
                <span key={"numberOfOtherPlayers"}> (+{Object.keys(playersTyping).length - maxTypingPlayersDisplay})</span>
              )}
              {i > maxTypingPlayersDisplay && <></>}
            </span>
          ))}
          <span>: </span>
          <span className="ellipsis ellipsis1">.</span>
          <span className="ellipsis ellipsis2">.</span>
          <span className="ellipsis ellipsis3">.</span>
        </div>
      )}
      <div className="chatInputContainer">
        <div className="chatInputText grow-wrap" data-replicated-value={chatInput}>
          <textarea
            name="text"
            rows="1"
            maxLength="150"
            placeholder={"chat with " + teamName + "..."}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            ref={chatInputRef}
            onFocus={scrollToBottom}
          ></textarea>
        </div>
        <Button className={"chatSendButton"} variant="primary" onClick={sendChatOnClick}>
          Chat
        </Button>
      </div>
    </div>
  );
};

export default Chat;

Chat.propTypes = {
  gameStateId: PropTypes.string,
  playerId: PropTypes.string,
  teamNumber: PropTypes.number,
  teamName: PropTypes.string,
};
