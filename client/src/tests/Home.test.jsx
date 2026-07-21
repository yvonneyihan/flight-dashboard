import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';

function mockFetchResponses() {
  global.fetch = vi.fn((url) => {
    if (url.startsWith('/api/users/check-auth')) {
      return Promise.resolve({ ok: true, json: async () => ({ authenticated: false }) });
    }
    if (url.startsWith('/api/flights')) {
      return Promise.resolve({ ok: true, text: async () => JSON.stringify({ flights: [], popularRoutes: [] }) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}), text: async () => '{}' });
  });
}

describe('Home page', () => {
  beforeEach(() => {
    mockFetchResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the search form and page structure without crashing', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Skylink Flight Schedule')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Departure Airport')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Arrival Airport')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No matching flights found.')).toBeInTheDocument();
    });
  });

  it('shows a flight count message once flights are loaded', async () => {
    global.fetch = vi.fn((url) => {
      if (url.startsWith('/api/users/check-auth')) {
        return Promise.resolve({ ok: true, json: async () => ({ authenticated: false }) });
      }
      if (url.startsWith('/api/flights')) {
        return Promise.resolve({
          ok: true,
          text: async () => JSON.stringify({
            flights: [{
              FlightID: 1,
              Airline: 'United',
              Status: 'On Time',
              ScheduledDeparture: '2026-08-15T10:00:00Z',
              DepartureAirport: 'JFK',
              ScheduledArrival: '2026-08-15T13:00:00Z',
              ArrivalAirport: 'LAX',
              Likes: 2,
              Dislikes: 0,
            }],
            popularRoutes: [],
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}), text: async () => '{}' });
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('1 flight found')).toBeInTheDocument();
    });
    expect(screen.getByText('United')).toBeInTheDocument();
  });
});
