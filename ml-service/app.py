from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import random
from dotenv import load_dotenv

# load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# openai set up
OPENAI_AVAILABLE = False

try:
    import openai
    openai.api_key = os.getenv('OPENAI_API_KEY')
    if openai.api_key and openai.api_key != 'key_optional':
        OPENAI_AVAILABLE = True
        print("OpenAI API key found. AI enhancements enabled.")
    else:
        print("OpenAI API key not set. Using rule-based predictions only.")
except ImportError:
    print("OpenAI not installed. Using rule-based predictions only.")

# Get market factors from GPT
def get_ai_market_insights(departure, arrival, day_of_week, days_until_flight):
    """
    Use GPT to analyze market conditions and provide adjustment factor
    Returns: dict with multiplier and reasoning
    """
    if not OPENAI_AVAILABLE:
        return {
            "multiplier": 1.0, 
            "reasoning": "AI insights unavailable",
            "used_ai": False
        }

    try:
        from openai import OpenAI
        client = OpenAI()
        # prompt for GPT to analyze market conditions
        prompt = f"""
        You are a flight pricing expert. Analyze this flight:
        Route: {departure} to {arrival}
        Days until departure: {days_until_flight}
        Day of week: {day_of_week} (0=Monday, 6=Sunday)

        Consider:
        1. Current season and holidays
        2. Route popularity and competition
        3. Typical booking patterns
        4. Any current events affecting travel

        Provide a price multiplier between 0.8 and 1.3 where:
        - 0.8 = 20% cheaper than normal (low demand)
        - 1.0 = normal price
        - 1.3 = 30% more expensive (high demand)

        Respond with ONLY valid JSON:
        {{"multiplier": 1.0, "reasoning": "brief explanation"}}
        """

        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=[
                {"role": "system", "content": "You are a flight pricing analyst. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=150,
            timeout=5
        )

        result = json.loads(response.choices[0].message.content)
        multiplier = float(result.get("multiplier", 1.0))

        # safety clamp
        multiplier = max(0.8, min(multiplier, 1.3))

        return {
            'multiplier': multiplier,
            'reasoning': result.get('reasoning', 'AI analysis complete'),
            'used_ai': True
        }
    except Exception as e:
        print(f"AI prediction failed: {e}")
        return {
            'multiplier': 1.0,
            'reasoning': f'AI unavailable: {str(e)}',
            'used_ai': False
        }

def calculate_rule_based_price(departure, arrival, days_until_flight, day_of_week):
    base_price = 100

    # Price factors
    urgency_factor = max(0, (30 - days_until_flight) * 5)
    weekend_factor = 50 if day_of_week in [4, 5, 6] else 0

    # Popular routes
    popular_routes = [
        ('JFK', 'LAX'), ('LAX', 'JFK'),
        ('ORD', 'SFO'), ('SFO', 'ORD'),
        ('ATL', 'MIA'), ('MIA', 'ATL')
    ]
    route_factor = 100 if (departure, arrival) in popular_routes else 0

    # Random variation
    random_factor = random.uniform(-20, 20)

    # Calculate predicted price
    predicted_price = base_price + urgency_factor + weekend_factor + route_factor + random_factor
    
    return {
        "predicted_price": round(predicted_price, 2),
        "breakdown": {
            "base_price": base_price,
            "urgency_factor": urgency_factor,
            "weekend_factor": weekend_factor,
            "route_factor": route_factor,
            "market_factor": round(random_factor, 2)
        }
    }
    
@app.route('/health', methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ml-service",
        "timestamp": datetime.now().isoformat(),
        "ai_enabled": OPENAI_AVAILABLE
    })

@app.route('/predict', methods=["POST"])
def predict():
    try:
        data = request.json
        departure = data.get('departure', '').upper()
        arrival = data.get('arrival', '').upper()
        departure_date = data.get('departureDate', '')

        if not departure or not arrival:
            return jsonify({"error": "Missing required fields: departure and arrival"}), 400
        
        # Calculate days until flight and day of week
        if departure_date:
            try:
                flight_date = datetime.strptime(departure_date, '%Y-%m-%d')
                days_until_flight = (flight_date - datetime.now()).days
                day_of_week = flight_date.weekday()
            except ValueError:
                return jsonify({
                    'error': 'Invalid date format. Use YYYY-MM-DD'
                }), 400
        else:
            days_until_flight = 30
            day_of_week = 0
        
        # prevent negativee days until flight
        if days_until_flight < 0:
            return jsonify({
                'error': 'Departure date cannot be in the past'
            }), 400
        
        # Calculate rule-based price
        rule_result = calculate_rule_based_price(departure, arrival, days_until_flight, day_of_week)
        base_price = rule_result['predicted_price']

        # Get AI market insights
        ai_insights = get_ai_market_insights(departure, arrival, day_of_week, days_until_flight)

        # Apply AI adjustment to base price
        final_price = round(base_price * ai_insights['multiplier'], 2)

        # Determine confidence
        if days_until_flight < 7:
            confidence = 0.95
        elif days_until_flight < 30:
            confidence = 0.85
        elif days_until_flight < 60:
            confidence = 0.75
        else:
            confidence = 0.65

        # Boost confidence if AI was used
        if ai_insights['used_ai']:
            confidence += 0.05
            confidence = min(confidence, 0.98)
        
        # Generate recommendation
        if days_until_flight < 7:
            recommendation = "Book now - prices typically increase last minute"
            urgency = "high"
        elif days_until_flight < 14:
            recommendation = "Good time to book"
            urgency = "medium"
        elif days_until_flight < 30:
            recommendation = "Consider waiting - prices may drop as airlines adjust inventory"
            urgency = "low"
        elif days_until_flight < 60:
            recommendation = "Monitor prices - still early to predict accurately"
            urgency = "very_low"
        else:
            recommendation = "Too early to predict - check back in 4-6 weeks"
            urgency = "too_early"
        
        # Retrun response
        response = {
            'predicted_price': final_price,
            'confidence': round(confidence, 2),
            'recommendation': recommendation,
            'urgency_level': urgency,
            
            # Prediction details
            'prediction_details': {
                'method': 'hybrid_ai' if ai_insights['used_ai'] else 'rule_based',
                'base_calculation': round(base_price, 2),
                'ai_adjustment': {
                    'multiplier': ai_insights['multiplier'],
                    'reasoning': ai_insights['reasoning'],
                    'applied': ai_insights['used_ai']
                }
            },
            
            # Price breakdown
            'price_factors': rule_result['breakdown'],
            
            # Flight context
            'flight_context': {
                'days_until_flight': days_until_flight,
                'day_of_week': day_of_week,
                'day_name': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day_of_week],
                'is_weekend': day_of_week in [4, 5, 6],
                'departure': departure,
                'arrival': arrival,
                'departure_date': departure_date
            }
        }
        
        return jsonify(response)

    except Exception as e:
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500
    
@app.route('/ai-status', methods=["GET"])
def ai_status():
    return jsonify({
        'ai_enabled': OPENAI_AVAILABLE,
        'provider': 'OpenAI GPT-3.5-turbo' if OPENAI_AVAILABLE else 'None',
        'fallback': 'rule_based',
        'message': 'AI enhancements active' if OPENAI_AVAILABLE else 'Running in rule-based mode'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f"\n{'='*50}")
    print(f"🚀 Flight Price Prediction Service")
    print(f"{'='*50}")
    print(f"Mode: {'Hybrid AI' if OPENAI_AVAILABLE else 'Rule-Based'}")
    print(f"Port: {port}")
    print(f"{'='*50}\n")

    app.run(host='0.0.0.0', port=port, debug=True)