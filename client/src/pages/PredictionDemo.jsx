import { useState } from 'react';
import PricePredictions from '../components/PricePredictions';

function PredictionDemo () {
  const [departure, setDeparture] = useState('JFK');
  const [arrival, setArrival] = useState('LAX');
  const [departureDate, setDepartureDate] = useState('2026-03-15');

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '40px' }}>
          ✈️ Flight Price Prediction
        </h1>

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
              <input
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                placeholder="Departure Airport"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Arrival Airport
              </label>
              <input
                type="text"
                value={arrival}
                onChange={(e) => setArrival(e.target.value.toUpperCase())}
                placeholder="Arrival Airport"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Departure Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                style={{
                  width: '100%',
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