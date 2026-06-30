import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdArrowForward, MdSearch, MdSchool, MdStar } from "react-icons/md";
import { useNavigate } from "react-router";
import useChatContext from "../context/useChatContext";
import {
  createRoom,
  joinRoomApi,
  rejoinProfessorRoom,
  saveProfessor,
  searchProfessors,
} from "../service/RoomService";

const emptyHostForm = {
  name: "",
  department: "",
  subject: "",
  topic: "",
  roomId: "",
  professorPin: "",
};

const emptyRejoinForm = {
  roomId: "",
  professorPin: "",
};

const JoinCreateChat = () => {
  const navigate = useNavigate();
  const {
    setRoomId,
    setCurrentUser,
    setConnected,
    setRoom,
    setProfessor,
    setRole,
    setProfessorToken,
  } = useChatContext();

  const [mode, setMode] = useState("student");
  const [studentName, setStudentName] = useState("");
  const [search, setSearch] = useState("");
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [professorAction, setProfessorAction] = useState("create");
  const [hostForm, setHostForm] = useState(emptyHostForm);
  const [rejoinForm, setRejoinForm] = useState(emptyRejoinForm);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        setProfessors(await searchProfessors(search.trim()));
      } catch {
        setProfessors([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  const enterRoom = (room, user, professor, userRole, accessToken = "") => {
    setCurrentUser(user);
    setRoomId(room.roomId);
    setRoom(room);
    setProfessor(professor);
    setRole(userRole);
    setProfessorToken(accessToken);
    setConnected(true);
    navigate("/chat");
  };

  const joinProfessorRoom = async (event) => {
    event.preventDefault();
    if (!selectedProfessor) {
      toast.error("Choose a professor first");
      return;
    }
    if (!studentName.trim()) {
      toast.error("Enter your name");
      return;
    }

    setLoading(true);
    try {
      const room = await joinRoomApi(selectedProfessor.roomId);
      enterRoom(room, studentName.trim(), selectedProfessor, "student");
      toast.success("You joined the doubt room");
    } catch (error) {
      toast.error(getErrorMessage(error, "This professor's room is not available"));
    } finally {
      setLoading(false);
    }
  };

  const createProfessorRoom = async (event) => {
    event.preventDefault();
    if (Object.values(hostForm).some((value) => !value.trim())) {
      toast.error("Complete all room details");
      return;
    }
    if (!/^\d{6}$/.test(hostForm.professorPin)) {
      toast.error("Professor PIN must contain exactly 6 digits");
      return;
    }

    setLoading(true);
    try {
      const professor = await saveProfessor({
        name: hostForm.name.trim(),
        department: hostForm.department.trim(),
        subject: hostForm.subject.trim(),
        topic: hostForm.topic.trim(),
        roomId: hostForm.roomId.trim(),
        online: true,
      });

      const access = await createRoom({
        roomId: hostForm.roomId.trim(),
        professorId: professor.id,
        professorName: professor.name,
        subject: hostForm.subject.trim(),
        topic: hostForm.topic.trim(),
        professorPin: hostForm.professorPin,
      });

      enterRoom(access.room, professor.name, professor, "professor", access.professorToken);
      toast.success("Your doubt room is live");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the room"));
    } finally {
      setLoading(false);
    }
  };

  const rejoinExistingRoom = async (event) => {
    event.preventDefault();
    if (!rejoinForm.roomId.trim() || !/^\d{6}$/.test(rejoinForm.professorPin)) {
      toast.error("Enter your room code and 6-digit professor PIN");
      return;
    }

    setLoading(true);
    try {
      const access = await rejoinProfessorRoom(
        rejoinForm.roomId.trim(),
        rejoinForm.professorPin,
      );
      const room = access.room;
      const professor = {
        id: room.professorId,
        name: room.professorName,
        subject: room.subject,
        topic: room.topic,
        roomId: room.roomId,
        online: true,
      };

      enterRoom(room, room.professorName, professor, "professor", access.professorToken);
      toast.success("Welcome back to your room");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not rejoin this room"));
    } finally {
      setLoading(false);
    }
  };

  const updateHostForm = (event) => {
    setHostForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const updateRejoinForm = (event) => {
    setRejoinForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <a className="brand" href="/" aria-label="DoubtRoom home">
          <span className="brand-mark"><MdSchool /></span>
          <span>DoubtRoom</span>
        </a>
        <span className="nav-note">Learn together, in real time.</span>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">LIVE ACADEMIC HELP</span>
          <h1>One room.<br />One doubt.<br /><em>Clear answers.</em></h1>
          <p>
            Find the right professor, enter a focused room and turn your question
            into a solved concept.
          </p>
          <div className="hero-stats">
            <div><strong>Instant</strong><span>professor search</span></div>
            <div><strong>Live</strong><span>doubt discussion</span></div>
            <div><strong>Focused</strong><span>subject rooms</span></div>
          </div>
        </div>

        <div className="entry-card">
          <div className="mode-switch" role="tablist" aria-label="Choose your role">
            <button
              className={mode === "student" ? "active" : ""}
              onClick={() => setMode("student")}
              type="button"
            >
              I am a student
            </button>
            <button
              className={mode === "professor" ? "active" : ""}
              onClick={() => setMode("professor")}
              type="button"
            >
              I am a professor
            </button>
          </div>

          {mode === "student" ? (
            <form onSubmit={joinProfessorRoom} className="entry-form">
              <div className="form-heading">
                <span>01</span>
                <div>
                  <h2>Find your professor</h2>
                  <p>Search by name and choose an active room.</p>
                </div>
              </div>

              <label className="field-label" htmlFor="professor-search">Professor name</label>
              <div className="search-field">
                <MdSearch />
                <input
                  id="professor-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Try “Tarun”"
                  autoComplete="off"
                />
                {searching && <span className="tiny-loader" aria-label="Searching" />}
              </div>

              <div className="professor-results">
                {professors.length === 0 && !searching ? (
                  <div className="empty-result">
                    <MdSchool />
                    <p>No professor found. A professor can create the first room.</p>
                  </div>
                ) : professors.map((professor) => (
                  <button
                    type="button"
                    key={professor.id}
                    className={`professor-option ${selectedProfessor?.id === professor.id ? "selected" : ""}`}
                    onClick={() => setSelectedProfessor(professor)}
                  >
                    <span className="professor-avatar">{getInitials(professor.name)}</span>
                    <span className="professor-details">
                      <strong>{professor.name}</strong>
                      <small>{professor.subject} · {professor.department}</small>
                      <small className="professor-topic">
                        Discussing: {professor.topic || "Topic not specified"}
                      </small>
                    </span>
                    <span className="professor-meta">
                      <small className={professor.online ? "status-online" : "status-offline"}>
                        {professor.online ? "Live" : "Offline"}
                      </small>
                      <small><MdStar /> {professor.ratingCount ? professor.averageRating : "New"}</small>
                    </span>
                  </button>
                ))}
              </div>

              <label className="field-label" htmlFor="student-name">Your name</label>
              <input
                className="text-field"
                id="student-name"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="How should we address you?"
              />

              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Joining…" : "Enter doubt room"}
                {!loading && <MdArrowForward />}
              </button>
            </form>
          ) : (
            <form
              onSubmit={professorAction === "create" ? createProfessorRoom : rejoinExistingRoom}
              className="entry-form host-form"
            >
              <div className="form-heading">
                <span>02</span>
                <div>
                  <h2>{professorAction === "create" ? "Host a doubt room" : "Return to your room"}</h2>
                  <p>
                    {professorAction === "create"
                      ? "Create a focused room students can discover."
                      : "Use your room code and secret professor PIN."}
                  </p>
                </div>
              </div>

              <div className="professor-action-switch" role="tablist" aria-label="Professor room action">
                <button
                  type="button"
                  className={professorAction === "create" ? "active" : ""}
                  onClick={() => setProfessorAction("create")}
                >
                  Create new room
                </button>
                <button
                  type="button"
                  className={professorAction === "rejoin" ? "active" : ""}
                  onClick={() => setProfessorAction("rejoin")}
                >
                  Rejoin my room
                </button>
              </div>

              {professorAction === "create" ? (
                <>
                  <div className="field-grid">
                    <FormField label="Professor name" name="name" value={hostForm.name} onChange={updateHostForm} placeholder="Dr. A. Sharma" />
                    <FormField label="Department" name="department" value={hostForm.department} onChange={updateHostForm} placeholder="Computer Science" />
                    <FormField label="Subject" name="subject" value={hostForm.subject} onChange={updateHostForm} placeholder="Data Structures" />
                    <FormField label="Topic" name="topic" value={hostForm.topic} onChange={updateHostForm} placeholder="Graph Algorithms" />
                  </div>
                  <FormField label="Unique room code" name="roomId" value={hostForm.roomId} onChange={updateHostForm} placeholder="DSA-GRAPHS-01" />
                  <FormField
                    label="Secret 6-digit professor PIN"
                    name="professorPin"
                    value={hostForm.professorPin}
                    onChange={updateHostForm}
                    placeholder="••••••"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="new-password"
                  />
                </>
              ) : (
                <div className="rejoin-fields">
                  <FormField label="Room code" name="roomId" value={rejoinForm.roomId} onChange={updateRejoinForm} placeholder="DSA-GRAPHS-01" />
                  <FormField
                    label="Professor PIN"
                    name="professorPin"
                    value={rejoinForm.professorPin}
                    onChange={updateRejoinForm}
                    placeholder="••••••"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="current-password"
                  />
                </div>
              )}

              <button
                className={`primary-button ${professorAction === "create" ? "accent" : ""}`}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? (professorAction === "create" ? "Creating…" : "Rejoining…")
                  : (professorAction === "create" ? "Create live room" : "Rejoin room")}
                {!loading && <MdArrowForward />}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
  autoComplete,
}) => (
  <label className="form-field">
    <span className="field-label">{label}</span>
    <input
      className="text-field"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      inputMode={inputMode}
      maxLength={maxLength}
      autoComplete={autoComplete}
    />
  </label>
);

const getInitials = (name = "") => name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data;
  return typeof message === "string" && message ? message : fallback;
};

export default JoinCreateChat;
