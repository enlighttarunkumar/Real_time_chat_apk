import { useState } from "react";
import ChatContext from "./ChatContextStore";

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [role, setRole] = useState("student");
  const [professorToken, setProfessorToken] = useState("");

  const clearSession = () => {
    setRoomId("");
    setCurrentUser("");
    setConnected(false);
    setRoom(null);
    setProfessor(null);
    setRole("student");
    setProfessorToken("");
  };

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        room,
        professor,
        role,
        professorToken,
        setRoomId,
        setCurrentUser,
        setConnected,
        setRoom,
        setProfessor,
        setRole,
        setProfessorToken,
        clearSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
