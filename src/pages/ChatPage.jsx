import React, { useEffect, useRef, useState } from 'react'
import { MdAttachFile, MdSend } from 'react-icons/md'
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { Stomp } from "@stomp/stompjs";
import toast from 'react-hot-toast';
import {baseURL} from "../config/AxiosHelper";
import { timeAgo } from "../config/helper";


const ChatPage = () => {
  const{roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser} = useChatContext()

  const navigate = useNavigate();
  useEffect(() => {
    if(!connected) {
      navigate("/")}
  },[connected, roomId, currentUser])
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        // console.log(messages);
        setMessages(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, []);

  //scroll down

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({},()=>{
        setStompClient(client);
        toast.success("Connected");
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);
          const newMessage = JSON.parse(message.body);
          setMessages((prev)=>[...prev, newMessage]);
        })
      })
    }
    if (connected) {
    connectWebSocket();
    }
  }, [roomId]);

  const sendMessage = async () => {
    if(stompClient && connected && input.trim()){
      console.log(input);
      const message={
        sender: currentUser,
        content: input,
        roomId: roomId
      }
      stompClient.send(`/app/sendMessage/${roomId}`,{}, JSON.stringify(message));
      setInput("");
    }
  }

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }


  useEffect(() => {
    async function loadMessages(){
      try {
       const messages = await getMessages(roomId);
       setMessages(messages);
      } catch (error) {}
    }
      if (connected) {
        loadMessages();
      }
  },[])

  return (
    <div>
      <header className='dark:border-gray-700 shadow border w-full h-20 py-4 dark:bg-gray-900 flex justify-around items-center'>
        <div>
            <h1 className='text-xl font-semibold'>Room : <span>{roomId}</span></h1>
        </div>
        <div>
            <h1 className='text-xl font-semibold'>User : <span>{currentUser}</span></h1>
        </div>
        <div>
            <button onClick={handleLogout} className='dark:bg-red-500 darl:hover:bg-red-700 px-3 py-2 rounded-full'>Leave Room</button>
        </div>
      </header>
      <main ref={chatBoxRef} className='pt-24 h-screen py-20 overflow-auto w-2/3 dark:bg-slate mx-auto'>
         {
          messages.map((message, index)=>(
            <div key={index} className={`flex ${messages.sender===currentUser?"justify-end":"justify-start"}`}>
              <div
              className={`my-2 ${
                message.sender === currentUser ? "bg-green-800" : "bg-gray-800"
              } p-2 max-w-xs rounded`}
            >
              <div className='flex flex-row gap-20'>
                <img className="h-10 w-10" src={"https://avatar.iran.liara.run/public"} alt="" />
                <div className='flex flex-col gap-1'>
                    <p className='text-sm font-bold'>{message.sender}</p>
                    <p>{message.content}</p>
                    <p className='text-xs text-gray-400'>{timeAgo(message.timeStamp)}</p>
                </div>
              </div>
            </div>
            </div>
          ))
        }
      </main>
      <div className='fixed bottom-3 w-full h-16'>
        <div className='h-full rounded items-center gap-4 justify-between flex px-7 w-2/3 mx-auto dark:bg-gray-900'>
            <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }} type="text" placeholder="Type your message here..." className="dark:bg-gray-900 px-3 w-full py-2 rounded focus:ring-0" />
            <div className='flex gap-1'>
            <button className="dark:bg-purple-600 h-10 w-10 flex justify-center items-center rounded-full"><MdAttachFile size={20}/></button>
            <button onClick={sendMessage} className="dark:bg-green-600 h-10 w-17 flex justify-center items-center rounded-full"><MdSend size={20}/></button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
