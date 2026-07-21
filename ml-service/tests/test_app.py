import json
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

import app as app_module


@pytest.fixture
def client():
    app_module.app.config['TESTING'] = True
    with app_module.app.test_client() as client:
        yield client


def future_date(days):
    return (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d')


def past_date(days):
    return (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')


# --- /health ---------------------------------------------------------

def test_health_returns_ok(client):
    res = client.get('/health')
    data = res.get_json()

    assert res.status_code == 200
    assert data['status'] == 'healthy'
    assert data['service'] == 'ml-service'
    assert 'ai_enabled' in data


# --- /predict validation ----------------------------------------------

def test_predict_missing_fields(client):
    res = client.post('/predict', json={'departure': 'JFK'})  # no arrival

    assert res.status_code == 400
    assert 'error' in res.get_json()


def test_predict_invalid_date_format(client):
    res = client.post('/predict', json={
        'departure': 'JFK', 'arrival': 'LAX', 'departureDate': '15-08-2026',
    })

    assert res.status_code == 400
    assert 'Invalid date format' in res.get_json()['error']


def test_predict_past_date_rejected(client):
    res = client.post('/predict', json={
        'departure': 'JFK', 'arrival': 'LAX', 'departureDate': past_date(5),
    })

    assert res.status_code == 400
    assert 'past' in res.get_json()['error'].lower()


# --- /predict prediction logic ------------------------------------------

def test_predict_rule_based_when_ai_unavailable(client, monkeypatch):
    monkeypatch.setattr(app_module, 'OPENAI_AVAILABLE', False)

    res = client.post('/predict', json={
        'departure': 'jfk', 'arrival': 'lax', 'departureDate': future_date(10),
    })
    data = res.get_json()

    assert res.status_code == 200
    assert data['prediction_details']['method'] == 'rule_based'
    assert data['prediction_details']['ai_adjustment']['applied'] is False
    assert data['confidence'] == 0.85  # 7-29 day bucket, no AI boost
    assert data['flight_context']['departure'] == 'JFK'  # uppercased


def test_predict_uses_ai_when_available(client, monkeypatch):
    monkeypatch.setattr(app_module, 'OPENAI_AVAILABLE', True)

    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps({'multiplier': 1.2, 'reasoning': 'peak season'})))
    ]
    mock_client_instance = MagicMock()
    mock_client_instance.chat.completions.create.return_value = fake_response

    with patch('openai.OpenAI', return_value=mock_client_instance):
        res = client.post('/predict', json={
            'departure': 'JFK', 'arrival': 'LAX', 'departureDate': future_date(3),
        })
    data = res.get_json()

    assert res.status_code == 200
    assert data['prediction_details']['method'] == 'hybrid_ai'
    assert data['prediction_details']['ai_adjustment']['applied'] is True
    assert data['prediction_details']['ai_adjustment']['multiplier'] == 1.2
    assert data['confidence'] == 0.98  # <7 day bucket (0.95) + 0.05 boost, capped
    expected_price = round(data['prediction_details']['base_calculation'] * 1.2, 2)
    assert data['predicted_price'] == expected_price


# --- calculate_rule_based_price (pure function) ------------------------

def test_rule_based_price_applies_weekend_and_popular_route_bonus():
    result = app_module.calculate_rule_based_price('JFK', 'LAX', days_until_flight=10, day_of_week=5)
    breakdown = result['breakdown']

    assert breakdown['base_price'] == 100
    assert breakdown['urgency_factor'] == 100  # (30 - 10) * 5
    assert breakdown['weekend_factor'] == 50   # Saturday
    assert breakdown['route_factor'] == 100    # JFK -> LAX is a popular route
    assert -20 <= breakdown['market_factor'] <= 20
    assert result['predicted_price'] == round(
        100 + 100 + 50 + 100 + breakdown['market_factor'], 2
    )


def test_rule_based_price_no_bonuses_for_quiet_weekday_route():
    result = app_module.calculate_rule_based_price('BOS', 'MIA', days_until_flight=40, day_of_week=1)
    breakdown = result['breakdown']

    assert breakdown['urgency_factor'] == 0  # max(0, (30 - 40) * 5)
    assert breakdown['weekend_factor'] == 0  # Tuesday
    assert breakdown['route_factor'] == 0    # not a tracked popular route


# --- get_ai_market_insights (pure function) -----------------------------

def test_ai_insights_fallback_when_disabled(monkeypatch):
    monkeypatch.setattr(app_module, 'OPENAI_AVAILABLE', False)

    result = app_module.get_ai_market_insights('JFK', 'LAX', 5, 10)

    assert result == {
        'multiplier': 1.0,
        'reasoning': 'AI insights unavailable',
        'used_ai': False,
    }


def test_ai_insights_clamps_multiplier_to_max(monkeypatch):
    monkeypatch.setattr(app_module, 'OPENAI_AVAILABLE', True)

    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps({'multiplier': 5.0, 'reasoning': 'huge spike'})))
    ]
    mock_client_instance = MagicMock()
    mock_client_instance.chat.completions.create.return_value = fake_response

    with patch('openai.OpenAI', return_value=mock_client_instance):
        result = app_module.get_ai_market_insights('JFK', 'LAX', 5, 10)

    assert result['multiplier'] == 1.3  # clamped from 5.0
    assert result['used_ai'] is True


def test_ai_insights_falls_back_on_exception(monkeypatch):
    monkeypatch.setattr(app_module, 'OPENAI_AVAILABLE', True)

    with patch('openai.OpenAI', side_effect=RuntimeError('network blew up')):
        result = app_module.get_ai_market_insights('JFK', 'LAX', 5, 10)

    assert result['used_ai'] is False
    assert 'network blew up' in result['reasoning']
