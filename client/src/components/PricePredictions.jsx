import { useState } from 'react';
import axios from 'axios';
import { FiZap, FiArrowUpRight, FiArrowDownRight, FiCpu } from 'react-icons/fi';
import ConfidenceGauge from './ConfidenceGauge';
import '../styles/PricePredictions.css';

const URGENCY_META = {
  high: { label: 'Book now', color: 'var(--red)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' },
  medium: { label: 'Good time to book', color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
  low: { label: 'Consider waiting', color: 'var(--emerald)', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' },
  very_low: { label: 'Still early', color: 'var(--primary)', bg: 'rgba(37, 99, 235, 0.1)', border: 'rgba(37, 99, 235, 0.2)' },
  too_early: { label: 'Too early to predict', color: 'var(--muted-foreground)', bg: 'var(--muted)', border: 'var(--border)' },
};

const FACTOR_LABELS = {
  base_price: 'Base Price',
  urgency_factor: 'Urgency',
  weekend_factor: 'Weekend',
  route_factor: 'Route Popularity',
  market_factor: 'Market Variation',
};

function PricePredictions({ departure, arrival, departureDate }) {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    if (!departure || !arrival || !departureDate) {
      setError('Please provide departure, arrival and date.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/predictions/price',
        { departure, arrival, departureDate },
        { timeout: 5000 });
      setPrediction(response.data.prediction);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Prediction failed');
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const urgency = prediction ? (URGENCY_META[prediction.urgency_level] || URGENCY_META.too_early) : null;

  return (
    <div className="sl-predict">
      <button
        onClick={fetchPrediction}
        disabled={loading}
        className="sl-btn-primary sl-predict-btn"
      >
        <FiZap size={14} /> {loading ? 'Analyzing...' : 'Get Price Evaluation'}
      </button>

      {error && (
        <div className="sl-predict-error">{error}</div>
      )}

      {loading && (
        <div className="sl-predict-loading">
          <div className="sl-spinner" />
          <p>Analyzing market conditions...</p>
        </div>
      )}

      {prediction && !loading && (
        <div className="sl-predict-results">
          <div className="sl-card sl-predict-hero">
            <div className="sl-predict-gauge-col">
              <p className="sl-label" style={{ marginBottom: 12 }}>{departure} → {arrival}</p>
              <ConfidenceGauge value={Math.round(prediction.confidence * 100)} />
            </div>
            <div className="sl-predict-price-col">
              <div className="sl-card-head" style={{ padding: 0, border: 'none' }}>
                <h3 className="sl-card-title">Price Evaluation</h3>
                <span className="sl-pill-muted">
                  <FiCpu size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                  {prediction.prediction_details.method === 'hybrid_ai' ? 'AI-Enhanced' : 'Rule-Based'}
                </span>
              </div>
              <p className="sl-muted sl-small" style={{ margin: '8px 0 16px' }}>
                Heuristic indicator based on booking conditions — a benchmark to inform your search, not a guaranteed fare.
              </p>
              <p className="sl-label">Estimated Typical Fare</p>
              <p className="mono sl-predict-amount">${prediction.predicted_price}</p>

              <div className="sl-predict-banner" style={{ background: urgency.bg, borderColor: urgency.border }}>
                {prediction.urgency_level === 'high' ? <FiArrowUpRight size={18} style={{ color: urgency.color }} /> : <FiArrowDownRight size={18} style={{ color: urgency.color }} />}
                <div>
                  <p className="sl-strong" style={{ fontSize: 13, color: urgency.color }}>{urgency.label}</p>
                  <p className="sl-muted sl-small">{prediction.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sl-card">
            <div className="sl-card-head"><h3 className="sl-card-title">Price Breakdown</h3></div>
            <div className="sl-factors-grid">
              {Object.entries(prediction.price_factors).map(([key, val]) => (
                <div key={key} className="sl-factor">
                  <span className="sl-muted sl-small">{FACTOR_LABELS[key] || key}</span>
                  <span className="mono sl-strong">${val}</span>
                </div>
              ))}
            </div>
          </div>

          {prediction.prediction_details.ai_adjustment.applied && (
            <div className="sl-card" style={{ padding: 20 }}>
              <h3 className="sl-card-title" style={{ marginBottom: 8 }}>AI-Generated Explanation</h3>
              <p className="sl-muted sl-small" style={{ lineHeight: 1.6 }}>{prediction.prediction_details.ai_adjustment.reasoning}</p>
              <p className="sl-muted sl-small mono" style={{ marginTop: 8 }}>Market adjustment: {prediction.prediction_details.ai_adjustment.multiplier}x</p>
            </div>
          )}

          <div className="sl-card" style={{ padding: 20, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p className="sl-label">Days Until Flight</p>
              <p className="mono sl-strong">{prediction.flight_context.days_until_flight} days</p>
            </div>
            <div>
              <p className="sl-label">Day of Week</p>
              <p className="mono sl-strong">{prediction.flight_context.day_name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PricePredictions;