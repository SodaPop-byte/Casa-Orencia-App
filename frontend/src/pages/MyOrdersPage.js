import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);

  // --- 1. Fetch Orders (FINAL, RELIABLE METHOD) ---
  useEffect(() => {
    // CRITICAL: Only proceed if the token EXISTS AND the user ID is present
    if (auth.token && auth.user?.id) { 
      setLoading(true);
      api.get('/orders/myorders')
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching my orders:", err);
          setLoading(false); 
          setOrders([]);
        });
    } else if (!auth.token) {
      // If logged out, stop loading
      setLoading(false);
      setOrders([]);
    }
    // Dependency now strictly forces a re-fetch when the user object is finally populated
  }, [auth.token, auth.user?.id]); 

  // --- 2. Listen for socket updates (No structural change) ---
  useEffect(() => {
    function onOrderStatusUpdate(updatedOrder) {
      if (auth.user && updatedOrder.userId?._id === auth.user.id) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      }
    }
    socket.on('orderStatusUpdated', onOrderStatusUpdate);
    return () => {
      socket.off('orderStatusUpdated', onOrderStatusUpdate);
    };
  }, [auth.user]); 

  // --- Rendering Logic (STRICT CHECKS) ---
  if (!auth.token) {
    return <div className="p-8 text-center bg-theme-light min-h-screen">Please log in to see your orders.</div>;
  }
  // If we are logged in but the user data (ID) hasn't loaded yet, show loading
  if (loading || !auth.user?.id) { 
    return <div className="p-8 text-center bg-theme-light min-h-screen">Loading your orders...</div>;
  }

  return (
    <div className="p-8 bg-theme-light min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold font-serif text-center text-gray-900 mb-8">
          My Order History
        </h1>
        
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 mt-12 py-16 bg-white rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold">No orders found.</h3>
            <p>Once you place an order, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              
              const placeholder = 'https://via.placeholder.com/150x100?text=No+Image';
              let displayImage = placeholder;
              
              if (order.productId?.imageUrls && order.productId.imageUrls.length > 0) {
                displayImage = order.productId.imageUrls[0];
              } 
              else if (order.productId?.imageUrl) {
                displayImage = order.productId.imageUrl;
              }

              return (
                <div key={order._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6">
                  
                  <img 
                    src={displayImage}
                    alt={order.productId?.name || 'Product'}
                    className="w-full sm:w-32 h-32 object-cover rounded-md mb-4 sm:mb-0"
                  />
                  
                  {/* Order Details */}
                  <div className="flex-grow text-left">
                    <h2 className="text-xl font-semibold font-serif text-theme-dark">
                      {order.productId?.name || 'Product Not Found'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 mt-2">
                      Quantity: <span className="font-semibold">{order.quantity}</span>
                    </p>
                    <p className="text-gray-700">
                      Total Price: <span className="font-semibold text-lg text-theme-dark">₱{order.totalPrice}</span>
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mt-4 sm:mt-0">
                    <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                      order.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-300' : 
                      'bg-red-100 text-red-800 border border-red-300' 
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;