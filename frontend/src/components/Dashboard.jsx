import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "../../src/styles.css"; // Import global styles

const socket = io("http://localhost:5000");

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [showModal, setShowModal] = useState(false);

  // Fetch products from the API when the component loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();

    socket.on("new_product", (product) => {
      setProducts((prev) => [...prev, product]);
    });

    socket.on("delete_product", (productId) => {
      setProducts((prev) => prev.filter((product) => product._id !== productId));
    });

    return () => {
      socket.off("new_product");
      socket.off("delete_product");
    };
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please enter both name and price!");
      return;
    }

    socket.emit("add_product", newProduct);
    setShowModal(false);
    setNewProduct({ name: "", price: "" });
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="product-container">
        {products.length === 0 ? (
             <p className="empty-message">
             <i className="fas fa-box-open"></i> 
             No products added yet
           </p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <span className="close-icon" onClick={() => handleDeleteProduct(product._id)}>×</span>
              <h2>{product.name}</h2>
              <p>$ {product.price}</p>
            </div>
          ))
        )}
      </div>

      <button className="add-product-btn" onClick={() => setShowModal(true)}>+</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <input
              type="text"
              placeholder="Product Name"
              className="input-field"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              className="input-field"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <div className="modal-buttons">
              <button className="btn-add" onClick={handleAddProduct}>Add</button>
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
