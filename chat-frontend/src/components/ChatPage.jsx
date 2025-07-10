import React, { useEffect, useRef, useState } from 'react'
import { MdAttachment, MdSend } from 'react-icons/md';
import useChatContext from "../context/ChatContext";
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { getMessages } from '../service/RoomService';
import { timeAgo } from '../config/timeago';
const ChatPage = () => {
    const navigate= useNavigate(); 
    const{roomId, currentUser, connected,setConnected,setRoomId,setCurrentUser} = useChatContext();
    useEffect(
    
    () =>{
        if(!connected) {
            navigate("/");
        }
    },[connected,roomId,currentUser]
    );
    const[messages, setMessages] = useState([]);
const[input,setInput] = useState("");
const inputref=useRef(null);
const chatBoxRef = useRef(null);
const[stompClient,setStompClient] = useState(null);


useEffect(()=>{
    async function loadMessages() {
        try{
            const messages =await getMessages(roomId)
            setMessages(messages);
            
        }
        catch(error){
        console.log("dsdas");

        }


    }
if(connected){
    loadMessages();
}
},[]

);




// stomp client ko start karo
 useEffect(() => {
    const connectWebSocket = () => {
      ///SockJS
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);

        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);

          //rest of the work after success receiving the message
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    //stomp client
  }, [roomId]);

// Message handling 

const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);

      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }

    //
  };
  // scroll down
  useEffect(
    ()=>{
        if(chatBoxRef.current){
            chatBoxRef.current.scroll({
                top:chatBoxRef.current.scrollHeight,
                behavior:"smooth",
            });
        }
    },[messages]
  )

  // Handling logout

  function handleLogOut(){
    stompClient.disconnect();
    setConnected(false);
    setRoomId('');
    setCurrentUser('');
    navigate("/");
  }
  return (
    <div className="">
        <header className = "dark:border-gray-700 py-5 flex justify-around items-center dark:bg-gray-700 fixed w-full">
            <div>
                <h1 className="text-xl font-semibold">Room : <span>{roomId}</span></h1>
            </div>
            <div>
                <h1 className="text-xl font-semibold">User : <span>{currentUser}</span></h1>

            </div>
            <div>
                <button onClick={handleLogOut}className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-lg">Leave Room</button>
            </div>
        </header>
      
        {/* content */}
<main
  ref={chatBoxRef}
  className="px-10 w-2/3 dark:bg-slate-600 mx-auto py-20 overflow-y-auto"
  style={{ height: "calc(100vh - 80px)" }}
>            <div className="message_container">

            {
                messages.map((messages,index)=>(
                    <div key= {index} className={`flex ${messages.sender== currentUser ? "justify-end":"justify-start"}`}>
                        <div className={`my-2 ${messages.sender == currentUser ? "bg-green-700":"bg-gray-700"} p-2 rounded-lg max-w-xs`}>
                        <div className="flex flex-row gap-2">
                        <img 
                        className="h-10 w-10" 
                        src={`https://avatar.iran.liara.run/public?username=${messages.sender}`} 
                        alt={messages.sender}
                        />
                        <div className=" flex flex-col gap-1">
                        <p className="text-sm font-bold">{messages.sender}</p>
                        <p>{messages.content}</p>
                        <p>{timeAgo(messages.timeStamp)}</p>
                        </div>
                    </div>
                    </div>
                    </div>
                ))
            }

        </div>
        </main>













      <div className="fixed bottom-2 w-full h-16">
        <div className="h-full flex items-center justify-between rounded-lg w-2/3 mx-auto dark:bg-gray-700">
        <input 
        value={input}
        onKeyDown = {(e) => {
            if (e.key === 'Enter') {
            sendMessage();
        }}}
        onChange={
            (e)=>(
                setInput(e.target.value)
            )
        }   

        type="text" placeholder="Type Here.......... " className="dark:bg-gray-700 px-3 py-2 rounded-lg  w-full h-full"/>
        <div className="flex gap-1">
        <button onClick={
            sendMessage
        }
        className="dark:bg-green-500 h-10 w-20 rounded-lg dark:hover:bg-blue-900 flex justify-center items-center">
        <MdSend size={20}/>
        </button>
        <button className="dark:bg-purple-500 h-10 w-20 rounded-lg dark:hover:bg-blue-900 flex justify-center items-center">
        <MdAttachment size={20}/>
        </button>
        </div>
        
        </div>

      </div>
    </div>
  );
};

export default ChatPage
