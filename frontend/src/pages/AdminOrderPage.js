import React, { useState, useEffect } from 'react';
import api from '../api'; // Use our "smart" api helper
import socket from '../socket'; // Import the socket

function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders when the page loads
  useEffect(() => {
    api.get('/orders')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  // Listen for new orders and status updates in real-time
  useEffect(() => {
    function onNewOrder(newOrderData) {
      // When a new order comes in, add it to the top of the list
      // We must re-fetch all to get the populated data
      api.get('/orders').then(res => setOrders(res.data));
    }

    function onOrderStatusUpdate(updatedOrder) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    }

    socket.on('newOrder', onNewOrder);
    socket.on('orderStatusUpdated', onOrderStatusUpdate);

    return () => {
      socket.off('newOrder', onNewOrder);
      socket.off('orderStatusUpdated', onOrderStatusUpdate);
    };
  }, []); // Removed dependency, socket listeners set once

  // Handle status change
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Alert is fine, but success is shown via socket update
      // alert(`Order marked as ${newStatus}`);
      // Socket.IO will handle the state update automatically
    } catch (err) {
      console.error(`Error updating order status to ${newStatus}:`, err);
      alert(`Failed to update order status.`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  return (
    // Use the theme-light background
    <div className="p-8 bg-theme-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Use the elegant serif font for the heading */}
        <h1 className="text-3xl font-bold font-serif text-center text-gray-900 mb-8">
          Manage Orders
        </h1>
        
        {/* Wrap the table in a styled card */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          {/* This div allows the table to scroll horizontally on small screens */}
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                {/* Styled table header */}
                <tr className="bg-gray-100 border-b-2 border-gray-200 text-gray-600 uppercase text-sm">
                  <th className="py-3 px-5 text-left">Date</th>
                  <th className="py-3 px-5 text-left">Reseller</th>
                  <th className="py-3 px-5 text-left">Product</th>
                  <th className="py-3 px-5 text-left">Qty</th>
                  <th className="py-3 px-5 text-left">Total</th>
                  <th className="py-3 px-5 text-left">Status</th>
                  <th className="py-3 px-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-4 px-5 text-sm">
                      {/* Format the date to be more readable */}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-sm">
                      {order.userId?.email || 'N/A'}
                    </td>
                    <td className="py-4 px-5 text-sm font-medium">
                      {order.productId?.name || 'N/A'}
                    </td>
                    <td className="py-4 px-5 text-sm">{order.quantity}</td>
                    <td className="py-4 px-5 text-sm font-semibold">₱{order.totalPrice}</td>
                    <td className="py-4 px-5 text-sm">
                      {/* Styled Status Badges */}
                       <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                        order.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-300' : 
                        'bg-red-100 text-red-800 border border-red-300' 
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm">
                      {/* Only show buttons if the order is "Pending" */}
                      {order.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Completed')}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded-md transition"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-md transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Show message if no orders */}
        {orders.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-12 py-16 bg-white rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold">No orders found.</h3>
            <p>When a reseller places an order, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderPage;