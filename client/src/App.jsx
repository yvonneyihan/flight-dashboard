import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditFlight from './pages/EditFlight';
import HeatAirportMap from './pages/HeatAirportMap';
import FlightReviews from './pages/FlightReviews';
import PredictionDemo from './pages/PredictionDemo';
import AppShell from './components/AppShell';

const App = () => {
  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<AppShell><Home /></AppShell>} />
        <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
        <Route path="/manual-flights/edit/:id" element={<AppShell><EditFlight /></AppShell>} />
        <Route path="/heatmap" element={<AppShell><HeatAirportMap /></AppShell>} />
        <Route path="/flights/:flightID/reviews" element={<AppShell><FlightReviews /></AppShell>} />
        <Route path="/predictions" element={<AppShell><PredictionDemo /></AppShell>} />
      </Routes>
    </>
  );
};

export default App;
