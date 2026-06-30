import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdCheckCircle,
  MdContentCopy,
  MdPushPin,
  MdSchool,
  MdSend,
  MdStar,
} from "react-icons/md";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { baseURL } from "../config/AxiosHelper";
import { timeAgo } from "../config/timeago";
import useChatContext from "../context/useChatContext";
import {
  getMessages,
  joinRoomApi,
  pinMessage,
  rateProfessor,
  resolveRoom,
  updateProfessorStatus,
} from "../service/RoomService";

const ChatPage = () => {
  const navigate = useNavigate();
  const {
    roomId,
    currentUser,
    connected,
    room,
    professor,
    role,
    professorToken,
    setRoom,
    setProfessor,
    clearSession,
  } = useChatContext();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [working, setWorking] = useState(false);
  const chatBoxRef = useRef(null);

  const roomDetails = room || {};
  const isResolved = roomDetails.status === "RESOLVED";
  const pinnedMessage = messages.find((message) => message.pinned);

  useEffect(() => {
    if (!connected || !roomId || !currentUser) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  useEffect(() => {
    if (!connected || !roomId) return undefined;

    const loadRoom = async () => {
      try {
        const [savedMessages, latestRoom] = await Promise.all([
          getMessages(roomId),
          joinRoomApi(roomId),
        ]);
        setMessages(savedMessages);
        setRoom(latestRoom);
      } catch {
        toast.error("Could not load the room history");
      }
    };

    loadRoom();
    const statusTimer = window.setInterval(async () => {
      try {
        const latestRoom = await joinRoomApi(roomId);
        setRoom(latestRoom);
        if (latestRoom.message) setMessages(latestRoom.message);
      } catch {
        // A temporary refresh failure should not remove the user from live chat.
      }
    }, 5000);

    return () => window.clearInterval(statusTimer);
  }, [connected, roomId, setRoom]);

  useEffect(() => {
    if (!connected || !roomId) return undefined;

    const socket = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(socket);
    client.debug = () => {};

    client.connect(
      {},
      () => {
        setStompClient(client);
        setSocketReady(true);
        client.subscribe(`/topic/room/${roomId}`, (frame) => {
          const newMessage = JSON.parse(frame.body);
          setMessages((current) => [...current, newMessage]);
        });
      },
      () => {
        setSocketReady(false);
        toast.error("Live connection could not be established");
      },
    );

    return () => {
      setSocketReady(false);
      if (client.connected) client.disconnect();
    };
  }, [connected, roomId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!stompClient || !socketReady || !input.trim() || isResolved) return;

    stompClient.send(
      `/app/sendMessage/${roomId}`,
      {},
      JSON.stringify({
        sender: currentUser,
        content: input.trim(),
        roomId,
        professorToken: role === "professor" ? professorToken : undefined,
      }),
    );
    setInput("");
  };

  const handlePin = async (messageId) => {
    if (!messageId) return;
    try {
      const selected = await pinMessage(roomId, messageId, professorToken);
      setMessages((current) => current.map((message) => ({
        ...message,
        pinned: message.messageId === selected.messageId,
      })));
      toast.success("Final answer pinned");
    } catch {
      toast.error("Could not pin this answer");
    }
  };

  const handleResolve = async () => {
    if (!pinnedMessage) {
      toast.error("Pin the final answer before resolving the doubt");
      return;
    }

    setWorking(true);
    try {
      setRoom(await resolveRoom(roomId, professorToken));
      toast.success("Doubt marked as resolved");
    } catch {
      toast.error("Could not resolve the doubt");
    } finally {
      setWorking(false);
    }
  };

  const submitRating = async () => {
    const professorId = professor?.id || roomDetails.professorId;
    if (!professorId || !rating) return;

    setWorking(true);
    try {
      const updatedProfessor = await rateProfessor(professorId, rating);
      setProfessor(updatedProfessor);
      setRated(true);
      toast.success("Thanks for your feedback");
    } catch {
      toast.error("Could not save your rating");
    } finally {
      setWorking(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room code copied");
    } catch {
      toast.error("Could not copy the room code");
    }
  };

  const leaveRoom = async () => {
    if (stompClient?.connected) stompClient.disconnect();
    if (role === "professor" && professorToken) {
      try {
        await updateProfessorStatus(roomId, false, professorToken);
      } catch {
        // Leaving the local room should still work if presence cannot be updated.
      }
    }
    clearSession();
    navigate("/");
  };

  return (
    <main className="chat-page">
      <header className="chat-header">
        <button className="icon-button" onClick={leaveRoom} aria-label="Leave room">
          <MdArrowBack />
        </button>
        <a className="brand compact" href="/" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><MdSchool /></span>
          <span>DoubtRoom</span>
        </a>
        <div className="header-room-title">
          <span>{roomDetails.subject || "Live room"}</span>
          <strong>{roomDetails.topic || roomId}</strong>
        </div>
        <span className={`room-status ${isResolved ? "resolved" : "open"}`}>
          {isResolved ? <MdCheckCircle /> : <span className="live-dot" />}
          {isResolved ? "Resolved" : "Live now"}
        </span>
      </header>

      <div className="chat-layout">
        <section className="conversation-panel">
          {pinnedMessage && (
            <div className="pinned-answer">
              <span><MdPushPin /> Final answer</span>
              <p>{pinnedMessage.content}</p>
              <small>Answered by {pinnedMessage.sender}</small>
            </div>
          )}

          {role === "professor" && !isResolved && (
            <div className="mobile-session-action">
              <span>Pin the final answer, then close the doubt.</span>
              <button onClick={handleResolve} disabled={working}>Resolve</button>
            </div>
          )}

          {role === "student" && isResolved && !rated && (
            <div className="mobile-session-action mobile-rating">
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className={value <= rating ? "selected" : ""}
                    onClick={() => setRating(value)}
                    aria-label={`Rate ${value} stars`}
                  >
                    <MdStar />
                  </button>
                ))}
              </div>
              <button onClick={submitRating} disabled={!rating || working}>Rate session</button>
            </div>
          )}

          <div className="message-list" ref={chatBoxRef}>
            {messages.length === 0 ? (
              <div className="conversation-empty">
                <span><MdSchool /></span>
                <h2>Start with your doubt</h2>
                <p>Give context, show what you tried and ask one clear question.</p>
              </div>
            ) : messages.map((message, index) => {
              const ownMessage = message.sender === currentUser;
              return (
                <article
                  className={`message-row ${ownMessage ? "own" : ""}`}
                  key={message.messageId || `${message.sender}-${index}`}
                >
                  <span className="message-avatar">{getInitials(message.sender)}</span>
                  <div className={`message-bubble ${message.pinned ? "is-pinned" : ""}`}>
                    <div className="message-heading">
                      <strong>{ownMessage ? "You" : message.sender}</strong>
                      <time>{timeAgo(message.timeStamp)}</time>
                    </div>
                    <p>{message.content}</p>
                    {role === "professor" && !isResolved && message.messageId && (
                      <button className="pin-action" onClick={() => handlePin(message.messageId)}>
                        <MdPushPin /> {message.pinned ? "Pinned answer" : "Pin as final answer"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className={`message-composer ${isResolved ? "disabled" : ""}`}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder={isResolved ? "This doubt has been resolved" : "Write your question or explanation…"}
              disabled={isResolved}
            />
            <button
              onClick={sendMessage}
              disabled={!socketReady || !input.trim() || isResolved}
              aria-label="Send message"
            >
              <MdSend />
            </button>
          </div>
        </section>

        <aside className="room-sidebar">
          <div className="sidebar-section professor-summary">
            <span className="large-avatar">{getInitials(roomDetails.professorName)}</span>
            <div>
              <small>ROOM HOST</small>
              <h2>{roomDetails.professorName || "Professor"}</h2>
              <p>{roomDetails.subject || "Subject room"}</p>
            </div>
          </div>

          <div className="sidebar-section room-information">
            <small>ROOM DETAILS</small>
            <dl>
              <div><dt>Topic</dt><dd>{roomDetails.topic || "General doubt"}</dd></div>
              <div>
                <dt>Room code</dt>
                <dd>
                  {roomId}
                  <button onClick={copyRoomCode} aria-label="Copy room code"><MdContentCopy /></button>
                </dd>
              </div>
              <div><dt>You joined as</dt><dd>{currentUser}</dd></div>
            </dl>
          </div>

          {role === "professor" && !isResolved && (
            <div className="sidebar-section resolve-card">
              <MdCheckCircle />
              <h3>Answer complete?</h3>
              <p>Pin the clearest response and close this doubt.</p>
              <button onClick={handleResolve} disabled={working}>Mark as resolved</button>
            </div>
          )}

          {role === "student" && isResolved && !rated && (
            <div className="sidebar-section rating-card">
              <span className="success-check"><MdCheckCircle /></span>
              <h3>Doubt resolved</h3>
              <p>How helpful was this session?</p>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className={value <= rating ? "selected" : ""}
                    onClick={() => setRating(value)}
                    aria-label={`Rate ${value} stars`}
                  >
                    <MdStar />
                  </button>
                ))}
              </div>
              <button className="rating-submit" disabled={!rating || working} onClick={submitRating}>
                Submit rating
              </button>
            </div>
          )}

          {rated && (
            <div className="sidebar-section thanks-card">
              <MdCheckCircle /> Feedback received. Thank you!
            </div>
          )}

          <button className="leave-button" onClick={leaveRoom}>Leave this room</button>
        </aside>
      </div>
    </main>
  );
};

const getInitials = (name = "") => name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

export default ChatPage;
