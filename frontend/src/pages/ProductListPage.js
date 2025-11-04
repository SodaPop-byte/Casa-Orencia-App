import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import socket from '../socket';
import { AuthContext } from '../context/AuthContext';
import PlaceOrderModal from '../components/PlaceOrderModal';
import ProductCard from '../components/ProductCard';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useNavigate } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce';

const categories = ['All', 'Barong', 'Saya', 'Fabric'];

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [productToOrder, setProductToOrder] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentSlides, setCurrentSlides] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // --- Fetch products useEffect (no changes) ---
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') {
      params.append('category', selectedCategory);
    }
    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm);
    }
    const url = `/products?${params.toString()}`;
    api.get(url)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [selectedCategory, debouncedSearchTerm]);

  // --- Socket listeners (no changes) ---
  useEffect(() => {
    function onNewProduct(newProduct) {
      const categoryMatch = selectedCategory === 'All' || newProduct.category === selectedCategory;
      const searchMatch = !debouncedSearchTerm || newProduct.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      if (categoryMatch && searchMatch) {
        setProducts(prevProducts => [newProduct, ...prevProducts]);
      }
    }
    function onStockUpdate(updatedProduct) {
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p._id === updatedProduct._id ? updatedProduct : p
        )
      );
       if (productToOrder && productToOrder._id === updatedProduct._id && isOrderModalOpen) {
          setProductToOrder(updatedProduct);
       }
    }
    function onProductDelete(data) {
       setProducts(prev => prev.filter(p => p._id !== data.id));
    }
    socket.on('newProduct', onNewProduct);
    socket.on('stockUpdated', onStockUpdate);
    socket.on('productUpdated', onStockUpdate);
    socket.on('productDeleted', onProductDelete);
    return () => {
      socket.off('newProduct', onNewProduct);
      socket.off('stockUpdated', onStockUpdate);
      socket.off('productUpdated', onStockUpdate);
      socket.off('productDeleted', onProductDelete);
    };
  }, [selectedCategory, debouncedSearchTerm, productToOrder, isOrderModalOpen]);

  // --- Modal Handlers (no changes) ---
  const openOrderModal = (product) => {
    setProductToOrder(product);
    setIsOrderModalOpen(true);
  };
  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setProductToOrder(null);
  };
  const handleOrderPlaced = () => { /* Socket handles update */ };

  const openLightbox = (product) => {
    if (!product.imageUrls || product.imageUrls.length === 0) return;
    const slides = product.imageUrls.map(url => ({ src: url }));
    setCurrentSlides(slides);
    setIsLightboxOpen(true);
  };

  const handleOrderClick = (product) => {
    if (auth.user) {
      openOrderModal(product);
    } else {
      navigate('/login');
    }
  };

  const userName = auth.user ? auth.user.email.split('@')[0] : 'Reseller';
  const welcomeName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="min-h-screen">
      
      {/* --- Hero Section --- */}
      <div className="bg-theme-dark">
        <div className="max-w-7xl mx-auto py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold font-serif tracking-tight text-white">
            Welcome, {welcomeName}!
          </h1>
          <p className="mt-4 text-lg leading-6 text-gray-200">
            Browse all available Barong, Saya, and fabrics. Stock is updated in real-time.
          </p>
        </div>
      </div>
      {/* --- END HERO SECTION --- */}

      {/* --- NEW: VALUE PROPOSITION SECTION --- */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          {/* Feature 1: Real-Time Inventory */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-3xl text-theme-dark mb-3">
              <span role="img" aria-label="clock">⏱️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 font-serif">Real-Time Inventory</h3>
            <p className="mt-2 text-sm text-gray-600">
              See live stock levels before you order, ensuring no delays or cancellations.
            </p>
          </div>
          
          {/* Feature 2: Exclusive Quality */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-3xl text-theme-dark mb-3">
              <span role="img" aria-label="diamond">💎</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 font-serif">Master Crafted Quality</h3>
            <p className="mt-2 text-sm text-gray-600">
              Finest Philippine materials, inspected and assured by Casa Orencia.
            </p>
          </div>
          
          {/* Feature 3: Reseller Direct Access */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-3xl text-theme-dark mb-3">
              <span role="img" aria-label="truck">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 font-serif">Direct Reseller Access</h3>
            <p className="mt-2 text-sm text-gray-600">
              Streamlined ordering process built for efficiency and speed.
            </p>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 max-w-7xl mx-auto" />
      {/* --- END VALUE PROPOSITION SECTION --- */}


      {/* --- Product Grid Section --- */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* --- Search & Filter Section --- */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by product name..."
              className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          {/* Filter Buttons */}
          <div className="flex justify-center items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`py-2 px-5 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-theme-dark text-white shadow'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-3xl font-bold font-serif text-center text-gray-900 mb-10">
          Available Products
        </h2>

        {loading && <p className="text-center text-gray-600">Loading products...</p>}

        {!loading && products.length === 0 && (
          <p className="text-center text-gray-600">No products found. Try changing your filters.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!loading && products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onImageClick={openLightbox}
              isAdminView={false} 
              onOrderClick={!auth.user || auth.user.role !== 'admin' ? handleOrderClick : null}
              isModalOpen={isOrderModalOpen}
            />
          ))}
        </div>
      </div>

      {/* --- Modals (no changes) --- */}
      <PlaceOrderModal
        isOpen={isOrderModalOpen}
        onRequestClose={closeOrderModal}
        productToOrder={productToOrder}
        onOrderPlaced={handleOrderPlaced}
      />
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={currentSlides}
      />
    </div>
  );
}

export default ProductListPage;