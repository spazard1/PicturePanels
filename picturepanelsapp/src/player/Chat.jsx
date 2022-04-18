import React from "react";
//import PropTypes from "prop-types";

import "./Chat.css";

const Chat = () => {
  return (
    <>
      <div className="chats hidden"></div>
      <div className="chatInputContainer hidden">
        <div className="chatInputText grow-wrap">
          <textarea name="text" rows="1" maxLength="150" placeholder="chat with your team..."></textarea>
        </div>
        <div className="defaultButton chatSendButton">Chat</div>
      </div>
    </>
  );
};

export default Chat;

Chat.propTypes = {};
