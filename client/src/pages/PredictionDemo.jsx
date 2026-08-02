import { useState } from 'react';
import PricePredictions from '../components/PricePredictions';
import AutocompleteInput from '../components/Autocomplete';

function PredictionDemo() {
  const [departure, setDeparture] = useState('JFK');
  const [arrival, setArrival] = useState('LAX');
  const [departureDate, setDepartureDate] = useState('2026-03-15');
  const handleDepartureChange = (e) => {
    setDeparture((e.target.value || '').toUpperCase());
  };

  const handleArrivalChange = (e) => {
    setArrival((e.target.value || '').toUpperCase());
  };

  return (
    <div className="sl-page" style={{ maxWidth: 760 }}>
      <div className="sl-page-head">
        <div>
          <h1 className="sl-page-title">Price Predictions</h1>
          <p className="sl-page-sub">AI-powered fare forecasting · rule-based + market model</p>
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <div className="sl-search-grid-3">
          <div className="sl-field">
            <label className="sl-label">Departure Airport</label>
            <AutocompleteInput
              label="Departure Airport"
              name="DepartureAirport"
              value={departure}
              onChange={handleDepartureChange}
              fetchUrl="/api/users/autocomplete"
              required
            />
          </div>

          <div className="sl-field">
            <label className="sl-label">Arrival Airport</label>
            <AutocompleteInput
              label="Arrival Airport"
              name="ArrivalAirport"
              value={arrival}
              onChange={handleArrivalChange}
              fetchUrl="/api/users/autocomplete"
              required
            />
          </div>

          <div className="sl-field">
            <label className="sl-label">Departure Date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="sl-input"
            />
          </div>
        </div>
      </div>

      <PricePredictions
        departure={departure}
        arrival={arrival}
        departureDate={departureDate}
      />
    </div>
  );
}

export default PredictionDemo;