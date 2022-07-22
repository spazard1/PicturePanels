import React, { useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import UserContext from "../user/UserContext";
import ModalLogin from "./modal/ModalLogin";
import ModalNewUser from "./modal/ModalNewUser";
import postUser from "../user/postUser";
import putLogin from "../user/putLogin";
import getUser from "../user/getUser";
import ModalContext from "./modal/ModalContext";

export default function LoginManager({ children }) {
  const [user, setUser] = useState();
  const [userToken, setUserToken] = useState();
  const [showModalLogin, setShowModalLogin] = useState(false);
  const [showModalNewUser, setShowModalNewUser] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(true);
  const { setModalMessage } = useContext(ModalContext);

  const onModalLoginClose = () => {
    setShowModalLogin(false);
  };

  const onModalNewUserClose = () => {
    setShowModalNewUser(false);
  };

  const promptLogin = useCallback(() => {
    setShowModalLogin(true);
  }, []);

  const promptNewUser = useCallback(() => {
    setShowModalNewUser(true);
  }, []);

  const logout = useCallback(() => {
    setUser();
    localStorage.removeItem("userToken");
  }, []);

  const onNewUser = (userInfo) => {
    setShowModalNewUser(false);
    setIsLoadingLogin(true);

    postUser(userInfo, (response) => {
      setIsLoadingLogin(false);

      if (response === 409) {
        // conflict
        setModalMessage("That username already exists. Please choose another.");
        return;
      }

      if (!response) {
        setModalMessage("Failed to create user. Please try again later.");
        return;
      }

      setModalMessage("User is created. You can now login in.");
    });
  };

  const onLogin = (userInfo) => {
    setShowModalLogin(false);
    setIsLoadingLogin(true);

    localStorage.setItem("userName", userInfo.userName);

    putLogin(userInfo, (response) => {
      setIsLoadingLogin(false);

      if (!response) {
        setModalMessage("Failed to login. Check your username/password and try again.");
        return;
      }

      setUser(response.user);
      setUserToken(response.userToken);
      localStorage.setItem("userToken", response.userToken);
    });
  };

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      getUser((user) => {
        setIsLoadingLogin(false);

        if (!user) {
          localStorage.removeItem("userToken");
          return;
        }

        setUser(user);
        setUserToken(localStorage.getItem("userToken"));
      });
    } else {
      setIsLoadingLogin(false);
    }
  }, [setUser]);

  return (
    <UserContext.Provider value={{ user, userToken, promptLogin, promptNewUser, logout, isLoadingLogin }}>
      <ModalLogin showModal={showModalLogin} onLogin={onLogin} onModalClose={onModalLoginClose} />
      <ModalNewUser showModal={showModalNewUser} onNewUser={onNewUser} onModalClose={onModalNewUserClose} />
      {children}
    </UserContext.Provider>
  );
}

LoginManager.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
