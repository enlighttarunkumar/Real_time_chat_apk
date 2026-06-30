import { useContext } from "react";
import ChatContext from "./ChatContextStore";

const useChatContext = () => useContext(ChatContext);

export default useChatContext;
