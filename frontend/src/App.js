import React, { useContext, useEffect, useState } from 'react'; 
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; 
import socket from './socket'; 

// Import Pages
import ProductListPage from './pages/ProductListPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminRoute from './components/AdminRoute'; // <-- Ensure this is correct
import AdminOrderPage from './pages/AdminOrderPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AuthRoute from './components/AuthRoute'; // <-- ENSURE THIS IMPORT IS CORRECT
import AdminDashboard from './pages/AdminDashboard'; 
import ContactOwnerModal from './components/ContactOwnerModal';

function App() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [newOrderCount, setNewOrderCount] = useState(0); // 4. Notification count state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); // 5. Chat modal state

  // Socket.IO Listener for New Orders
  useEffect(() => {
    // Only listen if user is logged in as admin
    if (auth.user && auth.user.role === 'admin') {
      socket.on('newOrder', (newOrder) => {
        console.log('--- Socket: New order received for admin ---');
        setNewOrderCount(prev => prev + 1); // Increment count
      });
      
      return () => {
        socket.off('newOrder');
      };
    } else {
        setNewOrderCount(0); // Reset if not admin
    }
  }, [auth.user]); // Reruns when user state changes (login/logout)

  const handleLogout = () => {
    setNewOrderCount(0); // Clear badge on logout
    logout();
    navigate('/login');
  };
  
  // Function to clear the notification when admin views the Dashboard or Orders list
  const handleClearNotifications = () => {
      setNewOrderCount(0);
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-theme-light"> 
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-lg border-b-2 border-theme-dark"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold font-serif text-theme-dark">
                Casa Orencia
              </Link>
              
              <div className="hidden sm:flex sm:space-x-6">
                <Link to="/" className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium">Shop</Link>
                
                {/* Admin Links */}
                {auth.user && auth.user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin" 
                      onClick={handleClearNotifications}
                      className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium relative"
                    >
                      Dashboard
                      {/* Blinking Badge - Only Dashboard gets the pulse */}
                      {newOrderCount > 0 && (
                        <span className="absolute top-1 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </Link>
                    <Link 
                      to="/admin/products" 
                      className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Manage Products
                    </Link>
                    <Link 
                      to="/admin/orders" 
                      onClick={handleClearNotifications}
                      className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium relative"
                    >
                      Manage Orders
                      {/* Notification Count Bubble */}
                      {newOrderCount > 0 && (
                        <span className="absolute top-0 right-[-10px] bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {newOrderCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Reseller Links */}
                {auth.user && auth.user.role !== 'admin' && (
                   <>
                       <Link to="/my-orders" className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium">
                         My Orders
                       </Link>
                       {/* Chat Button */}
                       <button onClick={() => setIsChatModalOpen(true)} className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium">
                         Chat
                       </button>
                   </>
                )}
              </div>
            </div>

            {/* Right Side: Auth Links */}
            <div className="flex items-center space-x-4">
              {!auth.user ? (
                // Logged Out
                <>
                  <Link to="/login" className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                  <Link to="/signup" className="bg-theme-accent text-white hover:bg-theme-accent-hover px-4 py-2 rounded-md text-sm font-medium">Sign Up</Link>
                </>
              ) : (
                // Logged In
                <>
                  <span className="text-gray-700 text-sm font-medium hidden sm:block">Hello, {auth.user.email}</span>
                  <button onClick={handleLogout} className="text-gray-700 hover:text-theme-accent px-3 py-2 rounded-md text-sm font-medium">Logout</button>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>
      {/* --- END NAVBAR --- */}

      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProductListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/my-orders" element={<AuthRoute><MyOrdersPage /></AuthRoute>} /> 

          {/* Admin-Only Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrderPage /></AdminRoute>} />
        </Routes>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-theme-dark font-serif">
            © {new Date().getFullYear()} **Casa Orencia** | All Rights Reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Developed by Da.
          </p>
        </div>
      </footer>
      
      {/* 4. RENDER THE CHAT MODAL */}
      <ContactOwnerModal 
        isOpen={isChatModalOpen} 
        onRequestClose={() => setIsChatModalOpen(false)} 
      />
    </div>
  );
}

export default App;