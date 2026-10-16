import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../App";

const ChatWithBuyer = () => {
    const [chats, setChats] = useState([]);
    const [groupedChats, setGroupedChats] = useState({});
    const [selectedChats, setSelectedChats] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [viewPapers, setViewPapers] = useState(null);

    const sellerEmail = sessionStorage.getItem("email");

    useEffect(() => {
        if (sellerEmail) {
            fetchChats();
        }
    }, [sellerEmail]);

    const fetchChats = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/seller/chats/?email=${sellerEmail}`);
            const chatData = response.data.chats || [];

            setChats(chatData);

            // Group chats by property ID
            const grouped = {};
            chatData.forEach((chat) => {
                const propertyId = chat.property.id;
                if (!grouped[propertyId]) {
                    grouped[propertyId] = {
                        property: chat.property,
                        chats: [],
                    };
                }
                grouped[propertyId].chats.push(chat);
            });

            setGroupedChats(grouped);
        } catch (error) {
            toast.error("Error fetching chats. Please try again.");
            console.error("Error fetching chats:", error);
        }
    };

    const handleViewChats = (propertyId) => {
        setSelectedChats(groupedChats[propertyId]?.chats || []);
        setSelectedProperty(groupedChats[propertyId]?.property || null);
    };

    const handleReplyUpdate = async (chatId) => {
        if (!replyMessage.trim()) return;
    
        try {
            await axios.patch(`${baseUrl}/api/seller/chats/${chatId}/`, {
                s_chat: replyMessage,
            });
    
            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.chat_id === chatId ? { ...chat, s_chat: replyMessage } : chat
                )
            );
    
            // Update selectedChats dynamically
            setSelectedChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.chat_id === chatId ? { ...chat, s_chat: replyMessage } : chat
                )
            );
    
            toast.success("Reply sent successfully!", { autoClose: 2000 });
            setReplyMessage("");
        } catch (error) {
            console.error("Error updating chat:", error);
        }
    };
    

    const handleDeletePaper = async (paperUrl) => {
        const filename = paperUrl.split("/").pop();  // Extracts filename like '02_Fdalacp.jpg'
        try {
            const response = await fetch(`${baseUrl}/api/seller/delete-paper/${filename}/`, {
                method: "DELETE",
                credentials: 'include',
            });
    
            if (response.ok) {
                toast.success("Paper deleted!");
                setViewPapers((prev) => prev.filter((url) => url !== paperUrl));
                fetchChats(); // <-- Refetch chats to get the latest property papers
            } else {
                const data = await response.text();
                console.error("Failed to delete:", data);
            }
        } catch (error) {
            console.error("Error deleting paper:", error);
        }
    };
    
    
      
      
      

    return (
        <div className="container mt-4">
            <h2 className="px-4 py-3 border border-dark rounded shadow-sm text-center" style={{ backgroundColor: "white", color: "black", textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)", fontWeight: "bold" }}>
                Chat with Buyers
            </h2>
            <ToastContainer />

            {Object.keys(groupedChats).length === 0 ? (
                <p className="text-white mt-5">No chats available.</p>
            ) : (
                <div className="row">
                    {Object.values(groupedChats).map(({ property, chats }) => (
                        <div key={property.id} className="col-md-4 mb-3">
                            <div className="card shadow-sm">
                                <img src={property.propertyPhoto} className="card-img-top" alt="Property" style={{ height: "200px", objectFit: "cover" }} />
                                <div className="card-body">
                                    <h5 className="card-title">{property.propertyName}</h5>
                                    <p className="text-muted">{property.city}</p>
                                    <button className="btn btn-info w-100 mb-2" onClick={() => handleViewChats(property.id)}>View Chats</button>
                                    {property.papers.length > 0 && (
                                        <button className="btn btn-info w-100" onClick={() => setViewPapers(property.papers)}>
                                            View Papers
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Chat Modal */}
            {selectedChats.length > 0 && (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog" style={{ maxWidth: "350px" }}> {/* Adjust width here */}
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title"> Chat about {selectedProperty?.propertyName || "Unknown Property"}</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedChats([])}></button>
                </div>
                <h6 className="text-center mb-3 text-primary">{selectedProperty?.buyer_email}</h6>
                <div className="modal-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {selectedChats.map((msg, index) => (
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
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your message..."
                    ></textarea>
                    <button 
                        className="btn btn-success" 
                        onClick={() => handleReplyUpdate(selectedChats[selectedChats.length - 1]?.chat_id)} 
                        disabled={!replyMessage.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    </div>
)}


          {/* Modal for Viewing Property Papers */}
          {viewPapers && (
  <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Property Papers</h5>
          <button type="button" className="btn-close" onClick={() => setViewPapers(null)}></button>
        </div>
        <div className="modal-body">
          {Array.isArray(viewPapers) && viewPapers.length > 0 ? (
            viewPapers.map((paper, index) => (
              <div key={index} className="mb-4 text-center border p-3 rounded shadow-sm">
                <h6 className="mb-3">Paper {index + 1}</h6>
                <img
                  src={paper}
                  alt={`Paper ${index + 1}`}
                  className="img-fluid mb-3"
                  style={{ maxHeight: '400px', borderRadius: '8px' }}
                />
                <br />
                <button className="btn btn-danger w-50" onClick={() => handleDeletePaper(paper)}>Delete</button>

              </div>
            ))
          ) : (
            <p className="text-center">No papers found.</p>
          )}
        </div>
      </div>
    </div>
  </div>
)}



            {/* Modal backdrop */}
            {(selectedChats.length > 0 || viewPapers) && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default ChatWithBuyer;
