import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditFlight from './pages/EditFlight';
import HeatAirportMap from './pages/HeatAirportMap';
import FlightReviews from './pages/FlightReviews';


const App = () => {
  const userId = localStorage.getItem('userId'); 
  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manual-flights/edit/:id" element={<EditFlight />} />
        <Route path="/heatmap" element={<HeatAirportMap />} />
        <Route path="/flights/:flightID/reviews" element={<FlightReviews />} />
      </Routes>
    </>
  );
};

export default App;
