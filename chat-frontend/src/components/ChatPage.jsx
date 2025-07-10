import React, { useEffect, useRef, useState } from 'react'
import { MdAttachment, MdSend } from 'react-icons/md';
import useChatContext from "../context/ChatContext";
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
const ChatPage = () => {
    const navigate= useNavigate(); 
    const{roomId, currentUser, connected,} = useChatContext();
    useEffect(
    
    () =>{
        if(!connected) {
            navigate("/");
        }
    },[connected,roomId,currentUser]
    );
    console.log(currentUser);
    const[messages, setMessages] = useState([
    {
        content : "Hello",
        sender : "Ben",
    },
    {
        content : "Hello",
        sender : "ankit",
    },
    {
        content : "Hello",
        sender : "arun",
    },
    {
        content : "Hello",
        sender : "Ben",
    },


]);
const[input,setInput] = useState("");
const inputref=useRef(null);
const chatBoxRef = useRef(null);
const[stompClient,setStompClient] = useState(null);

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


  return (
    <div className="">
        <header className = "dark:border-gray-700 py-5 flex justify-around items-center dark:bg-gray-700 fixed w-full">
            <div>
                <h1 className="text-xl font-semibold">Room : <span>Family Room</span></h1>
            </div>
            <div>
                <h1 className="text-xl font-semibold">User : <span>Ben Ten</span></h1>

            </div>
            <div>
                <button className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-lg">Leave Room</button>
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
                            <img className = "h-10 w-10"src="https://avatar.iran.liara.run/public" alt=""/>

                        <div className=" flex flex-col gap-1">
                        <p className="text-sm font-bold">{messages.sender}</p>
                        <p>{messages.content}</p>
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
        <input type="text" placeholder="Type Here.......... " className="dark:bg-gray-700 px-3 py-2 rounded-lg  w-full h-full"/>
        <div className="flex gap-1">
        <button className="dark:bg-green-500 h-10 w-20 rounded-lg dark:hover:bg-blue-900 flex justify-center items-center">
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
