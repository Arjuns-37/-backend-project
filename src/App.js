import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [stocks, setStocks] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    ticker: '',
    quantity: '',
    buyPrice: '',
  });

  const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080/api/stocks';

  // Fetch stocks on load
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(backendURL);
        setStocks(response.data);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };

    fetchStocks();
  }, [backendURL]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add or update a stock
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      ticker: formData.ticker,
      quantity: parseInt(formData.quantity, 10),
      buyPrice: parseFloat(formData.buyPrice),
    };

    try {
      if (formData.id) {
        // Update existing stock
        const response = await axios.put(`${backendURL}/${formData.id}`, payload);
        setStocks(stocks.map((stock) => (stock.id === formData.id ? response.data : stock)));
      } else {
        // Add new stock
        const response = await axios.post(backendURL, payload);
        setStocks([...stocks, response.data]);
      }
      setFormData({ id: '', name: '', ticker: '', quantity: '', buyPrice: '' });
    } catch (error) {
      console.error('Error saving stock:', error);
    }
    
  };

  // Edit a stock
  const handleEdit = (id) => {
    const stock = stocks.find((stock) => stock.id === id);
    setFormData(stock);
  };

  // Delete a stock
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendURL}/${id}`);
      setStocks(stocks.filter((stock) => stock.id !== id));
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  // Calculate total investment
  const totalInvestment = stocks.reduce(
    (total, stock) => total + stock.quantity * stock.buyPrice,
    0
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Portfolio Dashboard</h1>
      </header>
      <main>
        <section className="dashboard">
          <h2>Portfolio Metrics</h2>
          <p>Total Investment: ${totalInvestment.toFixed(2)}</p>
        </section>
        <section className="form-section">
          <h2>{formData.id ? 'Edit Stock' : 'Add Stock'}</h2>
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Stock Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="ticker"
              placeholder="Ticker Symbol"
              value={formData.ticker}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="buyPrice"
              placeholder="Buy Price"
              step="0.01"
              value={formData.buyPrice}
              onChange={handleInputChange}
              required
            />
            <button type="submit">{formData.id ? 'Update' : 'Add'}</button>
          </form>
        </section>
        <section className="stock-list">
          <h2>Current Holdings</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>Buy Price</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.id}>
                  <td>{stock.name}</td>
                  <td>{stock.ticker}</td>
                  <td>{stock.quantity}</td>
                  <td>${stock.buyPrice.toFixed(2)}</td>
                  <td>${(stock.quantity * stock.buyPrice).toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleEdit(stock.id)}>Edit</button>
                    <button onClick={() => handleDelete(stock.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default App;
