import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

import "./Chat.css";
import { useChats } from "./useChats";
import classNames from "classnames";

const Chat = ({ gameStateId, playerId, teamNumber }) => {
  const [chatInput, setChatInput] = useState();
  const chatsRef = useRef();
  const messagesEndRef = useRef();
  const firstLoadRef = useRef(true);
  const scrolledToBottom = useRef(false);

  const onLoading = useCallback(() => {}, []);
  const { chats, sendChat } = useChats(gameStateId, playerId, teamNumber, onLoading);

  const sendChatOnClick = () => {
    sendChat(chatInput);
    setChatInput("");
    scrollToBottom();
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

  return (
    <div className={"chatsContainer"}>
      <div onScroll={onScroll} ref={chatsRef} className="chats">
        {chats.map((chat) => (
          <div
            key={chat.ticks}
            className={classNames("chat", {
              selfChat: !chat.isSystem && chat.player && chat.player.playerId === playerId,
              othersChat: !chat.isSystem && chat.player && chat.player.playerId !== playerId,
            })}
          >
            {chat.player && chat.player.playerId !== playerId && (
              <>
                <span style={{ color: chat.player.color }}>{chat.player.name}</span>:{" "}
              </>
            )}
            <span>{chat.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatInputContainer">
        <div className="chatInputText grow-wrap" data-replicated-value={chatInput}>
          <textarea
            name="text"
            rows="1"
            maxLength="150"
            placeholder="chat with your team..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
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
};
