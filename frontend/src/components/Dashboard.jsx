import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "../../src/styles.css"; 

const socket = io("http://localhost:5000");

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      socket.emit("user_connected", userId);
    }
  }, [userId]);

  // Fetch users for selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);



  useEffect(() => {
    if (!selectedUser) return;
  
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/products/${userId}/${selectedUser}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
  
    fetchProducts();
  
    // new product updates
    const handleNewProduct = (product) => {
      if (
        (product.senderId === userId && product.receiverId === selectedUser) ||
        (product.senderId === selectedUser && product.receiverId === userId)
      ) {
        setProducts((prev) => [...prev, product]); 
      }
    };
  
    socket.on("new_product", handleNewProduct);
    socket.on("delete_product", (productId) => {
      setProducts((prev) => prev.filter((product) => product._id !== productId));
    });
  
    return () => {
      socket.off("new_product", handleNewProduct);
      socket.off("delete_product");
    };
  }, [selectedUser]);
  
  

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !selectedUser) {
      alert("Please enter product details and select a user!");
      return;
    }
  
    socket.emit("add_product", { ...newProduct, senderId: userId, receiverId: selectedUser });
  
    setShowModal(false);
    setNewProduct({ name: "", price: "" });
  };
  

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="user-selection">
        <label>Select User:</label>
        <select className="user-dropdown" onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Choose a user</option>
          {users
            .filter((user) => user._id !== userId) // Exclude logged-in user
            .map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
        </select>
      </div>

      <div className="product-container">
        {products.length === 0 ? (
          <p className="empty-message">
            <i className="fas fa-box-open"></i> No products shared yet
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
            <h2>Add Product</h2>
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
