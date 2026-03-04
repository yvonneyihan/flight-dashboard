import { useState } from 'react';
import PricePredictions from '../components/PricePredictions';
import AutocompleteInput from '../components/Autocomplete';
import MenuDropdown from '../components/MenuDropdown';


function PredictionDemo () {
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
    <div className='prediction-container'>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            marginBottom: "40px"
        }}
        >
        <div style={{ width: "120px" }} />
        <h1
            style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            margin: 0
            }}
        >
            ✈️ Flight Price Prediction
        </h1>
        <div>
            <MenuDropdown />
        </div>
        </header>
        {/* Input Form */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '16px', 
          margin: '0 auto 32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '600px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ display: 'grid', gap: '16px', width: '100%', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Departure Airport
              </label>
              <div className="form-group">
                <AutocompleteInput
                  label="Departure Airport"
                  name="DepartureAirport"
                  value={departure}                 
                  onChange={handleDepartureChange}  
                  fetchUrl="/api/users/autocomplete"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Arrival Airport
              </label>
              <div className="form-group">
                <AutocompleteInput
                  label="Arrival Airport"
                  name="ArrivalAirport"
                  value={arrival}                
                  onChange={handleArrivalChange}  
                  fetchUrl="/api/users/autocomplete"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Departure Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="form-control"
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Prediction Component */}
        <PricePredictions 
          departure={departure}
          arrival={arrival}
          departureDate={departureDate}
        />
      </div>
    </div>
  );
}

export default PredictionDemo;