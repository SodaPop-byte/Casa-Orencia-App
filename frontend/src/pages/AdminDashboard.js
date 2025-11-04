import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../api';
import socket from '../socket';
import { AuthContext } from '../context/AuthContext';

// Helper function to format Philippine Peso (No change)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
};

// Component to display a single metric card (No change)
const StatCard = ({ title, value, unit, color }) => (
  <div className={`bg-white shadow-lg rounded-lg border border-gray-200 p-4 transition duration-300 hover:shadow-xl`}>
    <p className="text-sm font-medium text-gray-500 font-serif">{title}</p>
    <div className="mt-1 flex justify-between items-center overflow-hidden"> 
      <p 
        className={`text-2xl sm:text-2xl font-bold ${color} whitespace-nowrap overflow-hidden text-ellipsis`} 
        title={value}
      > 
        {value}
      </p>
      {unit && <p className="text-lg text-gray-400">{unit}</p>}
    </div>
  </div>
);

// CRITICAL FIX: Helper function to build the storage key per user
const getChatKey = (userEmail) => `chat_history_${userEmail}`;


function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [allConversations, setAllConversations] = useState({}); 
  
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null); 
  const { auth } = useContext(AuthContext);
  
  const messagesEndRef = useRef(null); 

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [allConversations, activeConversation]);


  // --- 1. Data Fetch & Load History on Mount ---
  useEffect(() => {
    // Fetch initial stats
    api.get('/dashboard/stats')
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(err => { setError("Failed to load dashboard data."); console.error("Dashboard Load Error:", err); setLoading(false); });
      
    // Load all saved conversations from local storage
    if (auth.user) {
        let loadedConvos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Only load keys that match the chat history pattern
            if (key.startsWith('chat_history_')) {
                try {
                    loadedConvos[key.replace('chat_history_', '')] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    console.error("Error parsing stored history key:", key, e);
                }
            }
        }
        setAllConversations(loadedConvos);
    }
  }, [auth.user]); // Load when Admin logs in

  // --- 2. Socket Listener & Saving History ---
  useEffect(() => {
    function handleNewMessage(msg) {
      // CRITICAL FIX: Ignore message sent by THIS admin to prevent visual duplication
      if (auth.user && msg.senderRole === 'admin' && msg.userEmail === auth.user.email) {
          return; 
      }
      
      const userEmail = msg.senderRole === 'admin' ? msg.recipientEmail : msg.userEmail;
      
      setAllConversations(prevConvos => {
          const newThread = [...(prevConvos[userEmail] || []), msg];
          
          // CRITICAL: Save the updated thread instantly upon receiving a new message
          localStorage.setItem(getChatKey(userEmail), JSON.stringify(newThread));

          return {
              ...prevConvos,
              [userEmail]: newThread,
          };
      });
    }

    socket.on('receiveMessage', handleNewMessage);
    
    return () => {
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [auth.user]);


  // Handler to send a reply
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSendingReply || !activeConversation || !auth.user) return;

    setIsSendingReply(true);

    const replyMessage = {
      userEmail: auth.user.email, 
      recipientEmail: activeConversation, 
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
      senderRole: 'admin', 
    };

    socket.emit('sendMessage', replyMessage); 
    
    // Manually add the reply to the current conversation instantly AND save it
    setAllConversations(prevConvos => {
        const newThread = [...(prevConvos[activeConversation] || []), replyMessage];
        
        // CRITICAL: Save Admin's sent message instantly to persistence
        localStorage.setItem(getChatKey(activeConversation), JSON.stringify(newThread));

        return {
            ...prevConvos,
            [activeConversation]: newThread,
        };
    });

    setReplyText(''); 
    setIsSendingReply(false);
  };
  
  // Auto-set first conversation as active
  const chatUsers = Object.keys(allConversations).sort((a, b) => a.localeCompare(b));
  useEffect(() => {
      if (!activeConversation && chatUsers.length > 0) {
          setActiveConversation(chatUsers[0]);
      }
  }, [chatUsers, activeConversation]);
  
  const currentThread = allConversations[activeConversation] || [];

  
  if (loading) return <div className="p-8 text-center bg-theme-light min-h-screen">Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-center bg-theme-light min-h-screen text-red-600 font-bold">{error}</div>;

  const { inventory, sales } = stats;
  const totalRevenue = formatCurrency(sales.totalRevenue);
  const totalStockValue = formatCurrency(inventory.value);
  
  return (
    <div className="p-8 bg-theme-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-serif text-theme-dark mb-8">
          Casa Orencia - Inventory Overview
        </h1>

        {/* --- Main Grid: Stats (Left 2/3) + Chat (Right 1/3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left 2/3: Stats Section --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sales/Revenue Metrics */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-theme-dark">Sales & Orders</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Revenue (Completed)" value={totalRevenue} color="text-green-600" />
                <StatCard title="Total Sales Orders" value={sales.totalOrders} color="text-indigo-600" />
                <StatCard title="Orders Pending Shipment" value={sales.pendingOrders} color="text-theme-dark" />
                <StatCard title="Orders Cancelled" value={sales.cancelledOrders} color="text-red-500" />
              </div>
            </div>

            {/* Inventory Metrics */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-theme-dark">Stock Inventory</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Stock Value" value={totalStockValue} color="text-green-700" />
                <StatCard title="Total Stock Units" value={inventory.units} color="text-theme-accent-hover" unit="Units" />
              </div>
            </div>
          </div>
          
          {/* --- Right 1/3: Live Chat Section --- */}
          <div className="lg:col-span-1">
             <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-0 h-[600px] flex">
                 
                 {/* Chat Sidebar (User List) */}
                 <div className="w-1/3 border-r p-2 overflow-y-auto bg-gray-50">
                    <h3 className="text-md font-semibold mb-3 border-b pb-1">Users ({chatUsers.length})</h3>
                    {chatUsers.map(email => (
                        <div
                            key={email}
                            onClick={() => setActiveConversation(email)}
                            className={`p-2 cursor-pointer rounded-md text-sm truncate hover:bg-gray-100 ${
                                activeConversation === email ? 'bg-theme-accent-hover text-white font-bold' : 'text-gray-700'
                            }`}
                        >
                            {email.split('@')[0]}
                        </div>
                    ))}
                 </div>
                 
                 {/* Chat Window */}
                 <div className="w-2/3 flex flex-col justify-between">
                     <div className="p-4 border-b">
                         <h3 className="text-md font-bold text-theme-dark">
                             {activeConversation ? activeConversation.split('@')[0] : 'Select a User'}
                         </h3>
                     </div>

                     {/* Message Display Area */}
                     <div className="flex-grow p-4 overflow-y-auto space-y-3">
                         {currentThread.length === 0 && activeConversation ? (
                             <p className="text-gray-500 text-sm text-center pt-8">No messages in this thread.</p>
                         ) : (
                             currentThread.map((msg, index) => (
                                 <div 
                                     key={index} 
                                     className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                                 >
                                     <div className={`max-w-[85%] p-2 rounded-xl text-sm shadow-md ${
                                         msg.senderRole === 'admin' 
                                             ? 'bg-theme-dark text-white rounded-br-none' 
                                             : 'bg-gray-200 text-gray-800 rounded-tl-none'
                                     }`}>
                                         <p className="font-bold text-xs mb-1">
                                             {msg.senderRole === 'admin' ? 'You' : msg.userEmail.split('@')[0]}
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
                     
                     {/* Reply Input Form */}
                     {activeConversation && (
                         <form onSubmit={handleSendReply} className="p-4 border-t">
                             <div className="flex space-x-2">
                                 <input
                                     type="text"
                                     value={replyText}
                                     onChange={(e) => setReplyText(e.target.value)}
                                     placeholder="Type your reply..."
                                     className="flex-grow p-2 border rounded-l-lg focus:ring-theme-accent focus:border-theme-accent"
                                     disabled={isSendingReply}
                                 />
                                 <button
                                     type="submit"
                                     className="bg-theme-accent text-white py-2 px-4 rounded-r-lg hover:bg-theme-accent-hover disabled:bg-gray-400"
                                     disabled={isSendingReply || !replyText.trim()}
                                 >
                                     Send
                                 </button>
                             </div>
                         </form>
                     )}
                 </div>
             </div>
          </div>
          {/* --- END Live Chat Section --- */}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;