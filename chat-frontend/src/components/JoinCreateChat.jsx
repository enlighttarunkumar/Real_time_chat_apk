import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { createRoom as APi, joinRoomApi} from '../service/RoomService';
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';

const JoinCreateChat = () => {
  const[detail,setdetail] = useState(
  {
    UserName: "",
    RoomName: "",
    
  }
);
const navigate = useNavigate();
const{roomId,
        currentUser,
        connected,
        setRoomId,
        setCurrentUser,
        setConnected,}=useChatContext();

  

function handlingform(event){
  setdetail({
    ...detail,
    [event.target.name] : event.target.value,

  });
}
function check(){
  if(detail.UserName == "" || detail.RoomName == "") {
    toast.error("Invalid Input !");
    return false;
  }
  return true;
}
async function joinroom(){
  if(check()){
   

      try{
        const room = await joinRoomApi(detail.RoomName);
        toast.success("Joined Room !");
        setCurrentUser(detail.UserName);
        console.log(detail.UserName);
        setRoomId(room.roomId);
        setConnected(true);

        navigate("/chat");
      }
      catch(error){
        if(error.status == 400) {
            toast.error(error.response.data);
          }
          else {
            toast.error("Error in Joining room");
          }
      }
  }
}
  async function createroom(){
  if(check()){
      try{
        console.log(detail.RoomName);
        const response = await APi(detail.RoomName);
        console.log(response);
        toast.success("Room Created Successfully!");
        setCurrentUser(detail.UserName);
        setRoomId(response.roomId);
        setConnected(true);

        navigate("/chat");
      }
      catch(error){
          console.log(error);
          if(error.status == 400) {
            toast.error("ROOM EXISTS !")
          }
          else console.log("Error in creating room");
      } 
  }
}
  return (
    <div className='min-h-screen flex items-center justify-center'>

      <div className="p-10 w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow"> 
        <h1 className='text-2xl font-semibold text-center'>
            Join Room / Create Room...

        </h1>
        {/* name div*/}
        <div className="">
            <label htmlFor="name" className="black font-medium mb-2">
                Name
            </label>
            <input type="text" 
            name="UserName"
            value={detail.UserName}
            onChange={handlingform}
            placeholder="Enter Your Name "
            id="name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="">
            <label htmlFor="name" className="black font-medium mb-2">
                Room Id /New Room Id
            </label>
            <input type="text" 
    
            name="RoomName"
            value={detail.RoomName}
            onChange={handlingform}
            placeholder="Enter Room Id "
            id="Rname"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="flex justify-center gap-5 mt-4">
            <button onClick={joinroom}className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-lg">
                Join Room
            </button>
            <button onClick={createroom}className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-blue-800 rounded-lg">
                Create Room
            </button>
        </div>
      </div>
    </div>
  )
}

export default JoinCreateChat
