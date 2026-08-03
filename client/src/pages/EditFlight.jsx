import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import AutocompleteInput from '../components/Autocomplete';

const EditFlight = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState({
    FlightID: '',
    Airline: '',
    ScheduledDeparture: '',
    ScheduledArrival: '',
    DepartureAirport: '',
    ArrivalAirport: '',
    Note: ''
  });

  useEffect(() => {
    fetch(`/api/users/manual-flights/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFlight({
          FlightID: data.flightID,
          Airline: data.airline,
          ScheduledDeparture: new Date(data.departure).toISOString().slice(0, 16),
          ScheduledArrival: new Date(data.arrival).toISOString().slice(0, 16),
          DepartureAirport: data.depAirport || '',
          ArrivalAirport: data.arrAirport || '',
          Note: data.note || ''
        });
      })
      .catch((err) => console.error('❌ Failed to load flight data:', err));
  }, [id]);

  const handleChange = (e) => {
    setFlight({ ...flight, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/manual-flight/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flight),
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        console.error('❌ Update failed');
      }
    } catch (err) {
      console.error('❌ Error submitting form:', err);
    }
  };

  return (
    <div className="sl-page" style={{ maxWidth: 560 }}>
      <div className="sl-page-head">
        <div>
          <h1 className="sl-page-title">Edit Flight</h1>
          <p className="sl-page-sub">Update your saved itinerary</p>
        </div>
      </div>

      <form className="sl-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
        <div className="sl-field">
          <label className="sl-label">Flight ID</label>
          <input type="text" name="FlightID" value={flight.FlightID} onChange={handleChange} placeholder="Flight ID" className="sl-input" required />
        </div>
        <div className="sl-field">
          <label className="sl-label">Airline</label>
          <AutocompleteInput
            label="Airline"
            name="Airline"
            value={flight.Airline}
            onChange={handleChange}
            fetchUrl="/api/users/autocomplete/airlines"
            valueField="name"
            required
          />
        </div>
        <div className="sl-field">
          <label className="sl-label">Departure</label>
          <input type="datetime-local" name="ScheduledDeparture" value={flight.ScheduledDeparture} onChange={handleChange} className="sl-input" required />
        </div>
        <div className="sl-field">
          <label className="sl-label">Arrival</label>
          <input type="datetime-local" name="ScheduledArrival" value={flight.ScheduledArrival} onChange={handleChange} className="sl-input" />
        </div>
        <div className="sl-field">
          <label className="sl-label">Departure Airport</label>
          <AutocompleteInput
            label="Departure Airport"
            name="DepartureAirport"
            value={flight.DepartureAirport}
            onChange={handleChange}
            fetchUrl="/api/users/autocomplete"
            required
          />
        </div>
        <div className="sl-field">
          <label className="sl-label">Arrival Airport</label>
          <AutocompleteInput
            label="Arrival Airport"
            name="ArrivalAirport"
            value={flight.ArrivalAirport}
            onChange={handleChange}
            fetchUrl="/api/users/autocomplete"
            required
          />
        </div>
        <div className="sl-field">
          <label className="sl-label">Note</label>
          <input type="text" name="Note" value={flight.Note} onChange={handleChange} placeholder="Note" className="sl-input" />
        </div>
        <button type="submit" className="sl-btn-primary" style={{ justifyContent: 'center', marginTop: 6 }}>Save Changes</button>
      </form>

      <Link to="/dashboard" className="sl-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <FiArrowLeft size={13} /> Back to Dashboard
      </Link>
    </div>
  );
};

export default EditFlight;