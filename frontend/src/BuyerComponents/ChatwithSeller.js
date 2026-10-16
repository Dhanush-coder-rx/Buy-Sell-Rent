import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../App";

const ChatWithSeller = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState("");
    const [viewPapers, setViewPapers] = useState(null);
    const buyerEmail = sessionStorage.getItem("email");

    useEffect(() => {
        if (buyerEmail) fetchChats();
    }, [buyerEmail]);

    const fetchChats = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/get/buyer/chats/`, {
                params: { email: buyerEmail }
            });

            // Group messages by property ID
            const groupedChats = response.data.chats.reduce((acc, chat) => {
                const key = chat.property.id;
                if (!acc[key]) {
                    acc[key] = { ...chat, messages: [] };
                }
                acc[key].messages.push({ b_chat: chat.b_chat, s_chat: chat.s_chat, date: chat.date });
                return acc;
            }, {});

            // Convert grouped object into an array and sort messages by date
            setChats(
                Object.values(groupedChats).map(chat => ({
                    ...chat,
                    messages: chat.messages.sort((a, b) => new Date(a.date) - new Date(b.date))
                }))
            );

        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    const handleChatWithSeller = (chat) => {
        setSelectedChat(chat);
        setMessage("");
    };

    const handleSendMessage = async () => {
        if (!selectedChat || !message.trim()) return;
    
        try {
            await axios.post(`${baseUrl}/api/buyer/chats/`, {
                property: selectedChat.property.id,
                buyer_email: buyerEmail,
                b_chat: message
            });
    
            // Update the selectedChat messages dynamically
            const newMessage = { b_chat: message, date: new Date().toISOString() };
            setSelectedChat(prevChat => ({
                ...prevChat,
                messages: [...prevChat.messages, newMessage]
            }));
    
            // Update the chats list to reflect the new message
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.property.id === selectedChat.property.id
                        ? { ...chat, messages: [...chat.messages, newMessage] }
                        : chat
                )
            );
    
            toast.success("Message sent to seller!", { autoClose: 2000 });
    
            setMessage(""); // Clear the input field after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    

    return (
        <div className="container mt-4">
            <h2 className="px-4 py-3 border border-dark rounded shadow-sm text-center" style={{ backgroundColor: "white", color: "black", textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)", fontWeight: "bold" }}>
                Chat with Sellers
            </h2>
            <ToastContainer />

            {chats.length === 0 ? (
                <p className="text-white mt-5">No chats available.</p>
            ) : (
                <div className="row">
                    {chats.map((chat) => (
                        <div key={chat.property.id} className="col-md-4 mb-3">
                            <div className="card shadow-sm">
                                <img src={chat.property.propertyPhoto} className="card-img-top" alt="Property" style={{ height: "200px", objectFit: "cover" }} />
                                <div className="card-body">
                                    <h5 className="card-title">{chat.property.propertyName}</h5>
                                    <p className="text-muted">{chat.property.city}</p>
                                    <button className="btn btn-info w-100 mb-2" onClick={() => handleChatWithSeller(chat)}>Chat with Seller</button>
                                    {chat.property.papers.length > 0 && (
                                        <button className="btn btn-info w-100" onClick={() => setViewPapers(chat.property.papers)}>
                                            View Papers
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Property Papers Modal */}
            {viewPapers && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Property Papers</h5>
                                <button type="button" className="btn-close" onClick={() => setViewPapers(null)}></button>
                            </div>
                            <div className="modal-body text-center">
                                {viewPapers.map((paper, index) => (
                                    <img key={index} src={paper} alt="Paper" className="img-fluid mb-2" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

          {/* Chat Modal */}
{selectedChat && (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog" style={{ maxWidth: "350px" }}> {/* Adjust the width here */}
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Chat about {selectedChat.property.propertyName}</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedChat(null)}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <h6 className="text-center mb-3 text-primary">
                        {selectedChat.property.seller.name} - {selectedChat.property.seller.mobile}
                    </h6>
                    {selectedChat.messages.map((msg, index) => (
                        <div key={index} className="mb-2">
                            {msg.b_chat && <div className="alert alert-primary text-end">{msg.b_chat}</div>}
                            {msg.s_chat && <div className="alert alert-secondary text-start">{msg.s_chat}</div>}
                            <p className="text-center text-muted" style={{ fontSize: "12px" }}>
                                {new Date(msg.date).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="modal-footer">
                    <textarea
                        className="form-control"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                    ></textarea>
                    <button className="btn btn-success" onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    </div>
)}


            {/* Modal Background */}
            {(selectedChat || viewPapers) && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default ChatWithSeller;
