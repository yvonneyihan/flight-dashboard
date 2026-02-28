import { useState } from 'react';
import axios from 'axios';
import '../styles/PricePredictions.css';

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
                {departure, arrival, departureDate},
                {timeout: 5000});
            setPrediction(response.data.prediction);
            // Debug log
            console.log(response.data.prediction);
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
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
        case 'high': return '#ef4444';
        case 'medium': return '#f59e0b';
        case 'low': return '#10b981';
        default: return '#6b7280';
        }
    };
    const getConfidenceWidth = (confidence) => {
    return `${confidence * 100}%`;
    };
    return (
    <div className="price-prediction">
      <button 
        onClick={fetchPrediction} 
        disabled={loading}
        className="predict-button"
      >
        {loading ? 'Analyzing...' : ' Get Price Prediction'}
      </button>

      {error && (
        <div className="prediction-error">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="prediction-loading">
          <div className="spinner"></div>
          <p>Analyzing market conditions...</p>
        </div>
      )}

      {prediction && !loading && (
        <div className="prediction-result">
          <div className="prediction-header">
            <h3>Price Prediction</h3>
            <div className="prediction-method">
              {prediction.prediction_details.method === 'hybrid_ai' ? '🤖 AI-Enhanced' : '📊 Rule-Based'}
            </div>
          </div>

          {/* Main Price */}
          <div className="predicted-price">
            <div className="price-label">Predicted Price</div>
            <div className="price-amount">${prediction.predicted_price}</div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: getConfidenceWidth(prediction.confidence) }}
              ></div>
            </div>
            <div className="confidence-text">
              {Math.round(prediction.confidence * 100)}% confidence
            </div>
          </div>

          {/* Recommendation */}
          <div 
            className="recommendation" 
            style={{ borderLeftColor: getUrgencyColor(prediction.urgency_level) }}
          >
            <div className="urgency-badge" style={{ backgroundColor: getUrgencyColor(prediction.urgency_level) }}>
              {prediction.urgency_level.toUpperCase()}
            </div>
            <p>{prediction.recommendation}</p>
          </div>

          {/* Price Factors */}
          <div className="price-factors">
            <h4>Price Breakdown</h4>
            <div className="factors-grid">
              <div className="factor">
                <span className="factor-label">Base Price</span>
                <span className="factor-value">${prediction.price_factors.base_price}</span>
              </div>
              <div className="factor">
                <span className="factor-label">Urgency</span>
                <span className="factor-value">+${prediction.price_factors.urgency_factor}</span>
              </div>
              <div className="factor">
                <span className="factor-label">Weekend</span>
                <span className="factor-value">+${prediction.price_factors.weekend_factor}</span>
              </div>
              <div className="factor">
                <span className="factor-label">Route Popularity</span>
                <span className="factor-value">+${prediction.price_factors.route_factor}</span>
              </div>
            </div>
          </div>

          {/* AI Adjustment (if applicable) */}
          {prediction.prediction_details.ai_adjustment.applied && (
            <div className="ai-insight">
              <h4>🤖 AI Market Analysis</h4>
              <p className="ai-reasoning">
                {prediction.prediction_details.ai_adjustment.reasoning}
              </p>
              <p className="ai-multiplier">
                Market adjustment: {prediction.prediction_details.ai_adjustment.multiplier}x
              </p>
            </div>
          )}

          {/* Flight Context */}
          <div className="flight-context">
            <div className="context-item">
              <span className="context-label">Days Until Flight</span>
              <span className="context-value">{prediction.flight_context.days_until_flight} days</span>
            </div>
            <div className="context-item">
              <span className="context-label">Day of Week</span>
              <span className="context-value">{prediction.flight_context.day_name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PricePredictions;