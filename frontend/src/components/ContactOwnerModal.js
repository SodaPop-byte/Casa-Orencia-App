import React, { useState, useContext, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import socket from '../socket';
import { AuthContext } from '../context/AuthContext';

// --- Modal Styling (CRITICALLY FIXED WIDTH) ---
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '300px', // <-- FINAL WIDTH FIX
    maxHeight: '60vh', 
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
};
Modal.setAppElement('#root');

function ContactOwnerModal({ isOpen, onRequestClose }) {
  const { auth } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null); 

  // Auto-scroll on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);


  // 1. Load History from Local Storage on Login/Open
  useEffect(() => {
    if (auth.user) {
      const key = `chat_history_${auth.user.email}`;
      const savedHistory = localStorage.getItem(key);
      if (savedHistory) {
        try {
          setConversation(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Could not parse saved chat history:", e);
          setConversation([]);
        }
      } else {
        setConversation([]);
      }
    } else {
        setConversation([]);
    }
  }, [auth.user, isOpen]);

  // 2. Save History to Local Storage on Change
  useEffect(() => {
    if (auth.user && conversation.length > 0) {
      const key = `chat_history_${auth.user.email}`;
      localStorage.setItem(key, JSON.stringify(conversation));
    }
  }, [conversation, auth.user]);


  // 3. Socket listener to receive messages (FINAL PRIVACY FIX)
  useEffect(() => {
    function handleIncomingMessage(msg) {
      const currentUserEmail = auth.user?.email;

      if (currentUserEmail) {
        const isMe = msg.userEmail === currentUserEmail;
        const isToMe = msg.recipientEmail === currentUserEmail;
        
        // Only show message if it is FROM me or DIRECTLY TO me (fixes privacy leak)
        if (isMe || isToMe) {
          setConversation(prev => [...prev, msg]);
        }
      }
    }

    socket.on('receiveMessage', handleIncomingMessage);
    
    return () => {
      socket.off('receiveMessage', handleIncomingMessage);
    };
  }, [auth.user]);


  // Handler to send the message 
  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || isSending || !auth.user) return;

    setIsSending(true);

    const chatMessage = {
      userEmail: auth.user.email,
      text: message.trim(),
      timestamp: new Date().toISOString(),
      senderRole: 'reseller',
      recipientEmail: 'admin@test.com',
    };

    socket.emit('sendMessage', chatMessage); 
    
    // Manually add to state immediately (relies on filtered socket echo)
    setConversation(prev => [...prev, chatMessage]); 
    
    setMessage('');
    setIsSending(false); 
  };
  
  if (!auth.user) {
    return (
      <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles} contentLabel="Chat">
        <p className="text-center text-red-500">Please log in to chat with the owner.</p>
        <button onClick={onRequestClose} className="w-full mt-4 bg-gray-300 py-2 rounded">Close</button>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Live Chat"
    >
      <h2 className="text-xl font-bold font-serif text-theme-dark text-center mb-4">
        Your Chat with Casa Orencia
      </h2>

      {/* MESSAGE HISTORY DISPLAY */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3 h-64 border rounded mb-4">
        {conversation.length === 0 ? (
            <p className="text-gray-500 text-sm text-center pt-8">Start the conversation!</p>
        ) : (
            conversation.map((msg, index) => (
                <div 
                    key={index} 
                    className={`flex ${msg.senderRole === 'reseller' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[85%] p-2 rounded-xl text-sm shadow-md ${
                        msg.senderRole === 'reseller' 
                            ? 'bg-indigo-200 text-gray-800 rounded-br-none'
                            : 'bg-theme-accent-hover text-white rounded-tl-none'
                    }`}>
                        <p className="font-bold text-xs mb-1">
                            {msg.senderRole === 'reseller' ? 'You' : 'Admin'}
                        </p>
                        <p>{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* SEND MESSAGE FORM */}
      <form onSubmit={handleSend} className="space-y-4">
        <textarea
          className="w-full p-3 border rounded h-24 resize-none focus:ring-theme-accent"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!auth.user}
        />
        <button
          type="submit"
          className="w-full bg-theme-accent text-white py-2 rounded hover:bg-theme-accent-hover disabled:bg-gray-400"
          disabled={!message.trim()}
        >
          Send Message
        </button>
      </form>

      <button onClick={onRequestClose} className="w-full mt-4 bg-gray-200 py-2 rounded hover:bg-gray-300">
        Close Chat
      </button>
    </Modal>
  );
}

export default ContactOwnerModal;