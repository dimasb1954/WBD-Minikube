import { useEffect, useRef, useState } from "react";
import dummy from "../assets/dummy.png";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { IoSendSharp } from "react-icons/io5";
import api, { getCookie, isJwtExist } from "../api/api.ts";
import { formatDistanceToNow } from "date-fns";
import { io } from "socket.io-client";

function Message() {
    const navigate = useNavigate();
    const [listChatData, setListChatData] = useState([]);
    const [chatData, setChatData] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [idTemp, setIdTemp] = useState(0);
    const [newChat, setNewChat] = useState("");
    const [name, setName] = useState("");
    const [socket, setSocket] = useState(null);
    const [idOwn, setIdOwn] = useState(null);
    const [idTarget, setIdTarget] = useState("");
    const chatEndRef = useRef(null);

    const handleOpenChat = (connId, name) => {
        setChatData([]);
        setIdTemp(parseInt(connId));
        setName(name);
        setIsChatOpen(true);

        api.get(`/messaging/${parseInt(connId)}`)
            .then((res) => {
                setChatData(res.data.getMessage);
                setIdOwn(res.data.userId);
                setIdTarget(res.data.targetId);
                socket.emit("joinRoom", { fromId: res.data.userId, toId: res.data.targetId });
            })
            .catch((err) => console.log(err));
    };

    const handleCloseChat = () => {
        setIdTemp(0);
        setName("");
        setIsChatOpen(false);
        setChatData([]);
    };

    const handleSubmitChat = (e) => {
        e.preventDefault();
        const timestamp = new Date().toISOString(); // Generate ISO timestamp
    
        // Add to backend
        api.post(`/messaging/${idTemp}`, { content: newChat })
            .then((res) => {
                const temp = chatData.concat(res.data);
                setChatData(temp);
            })
            .catch((err) => console.log(err));
    
        // Create a new message object with a timestamp
        const messageData = {
            fromId: idOwn,
            toId: idTarget,
            message: newChat,
            timestamp: timestamp,

        };
    
        // Emit message to WebSocket
        socket.emit("sendMessage", messageData);
    
        // Optimistically update UI
        setChatData((prev) => [...prev, messageData]);
    
        setNewChat(""); // Clear input
    };
    

    useEffect(() => {
        const newSocket = io("http://localhost:3000", { withCredentials: true });
        setSocket(newSocket);

        newSocket.on("newMessage", (message) => {
            console.log(message);
            setChatData((prev) => [...prev, message]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!isJwtExist()) {
            navigate("/login");
        } else {
            api.get(`/messaging`)
                .then((res) => {
                    setListChatData(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [navigate]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatData]);

    api.interceptors.request.use(
        (config) => {
            const token = getCookie("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return (
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-4 mt-16 sm:px-8 md:px-16 lg:px-0">
            <div className="left-side w-full lg:w-2/3 flex flex-col bg-white md:rounded-lg border border-gray-300 h-fit">
                <div className="p-4 border-b border-gray-300 flex flex-row justify-between">
                    <div className="font-semibold">Messaging</div>
                </div>
                <div className="flex flex-row">
                    <div className="w-1/3 md:w-2/5 border-r border-gray-300 flex flex-col">
                        {listChatData.length > 0 ? (
                            listChatData.map((participant) => (
                                <button
                                    key={participant.id}
                                    className="text-left p-4 border-b border-gray-300 font-semibold hover:bg-gray-100 duration-200"
                                    onClick={() => handleOpenChat(participant.id, participant.fullName)}
                                >
                                    {participant.fullName}
                                </button>
                            ))
                        ) : (
                            <div className="text-center p-4">No conversations yet.</div>
                        )}
                    </div>
                    <div className="w-2/3 md:w-3/5 flex flex-col h-fit">
                        {isChatOpen ? (
                            <div>
                                <div className="w-full p-2 font-semibold border-b border-gray-300 flex flex-row">
                                    <button className="mx-1 font-xl" onClick={handleCloseChat}>
                                        <IoMdClose />
                                    </button>
                                    {name}
                                </div>
                                {chatData.length > 0 ? (
                                    <div className="w-full flex flex-col h-96 overflow-x-auto">
                                        {chatData.map((chat, index) => (
                                            <div key={index} className="w-full flex flex-col">
                                                {chat.toId == idTemp ? (
                                                    <div className="flex flex-col justify-end mr-2 mt-2">
                                                        <div className="flex justify-end">
                                                            <div className="text-md bg-gray-100 max-w-72 w-fit py-1 px-2 text-right rounded-md">
                                                                {chat.message}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-right">
                                                            {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col justify-start ml-2 mt-2">
                                                        <div className="text-md bg-gray-100 max-w-72 w-fit py-1 px-2 text-left rounded-md">
                                                            {chat.message}
                                                        </div>
                                                        <div className="text-xs">
                                                            {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-96">
                                        <div className="text-center">No messages yet</div>
                                    </div>
                                )}
                                <form onSubmit={handleSubmitChat}>
                                    <textarea
                                        className="w-full p-2 border-t-2 focus:outline-none focus:border-green-800"
                                        rows={3}
                                        placeholder="Write a message..."
                                        value={newChat}
                                        onChange={(e) => setNewChat(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end m-2">
                                        <button
                                            type="submit"
                                            className="text-blue-600 text-2xl hover:text-blue-800 duration-200" 
                                        >
                                            <IoSendSharp />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">Select a chat to start messaging</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="w-1/4 right-side hidden lg:block">
                <div className="bg-white sm:rounded-lg border border-gray-300 overflow-hidden sticky top-16">
                    <img src={dummy} style={{ width: "full" }} alt="dummy" />
                </div>
            </div>
        </div>
    );
}

export default Message;
