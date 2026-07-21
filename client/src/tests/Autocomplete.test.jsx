import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AutocompleteInput from '../components/Autocomplete';

describe('AutocompleteInput', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not fetch suggestions when fewer than 2 characters are typed', () => {
    const handleChange = vi.fn();
    render(
      <AutocompleteInput label="Departure Airport" value="" onChange={handleChange} fetchUrl="/api/users/autocomplete" name="dep" />
    );

    fireEvent.change(screen.getByPlaceholderText('Departure Airport'), { target: { value: 'j' } });

    expect(handleChange).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches and displays suggestions once 2+ characters are typed', async () => {
    const handleChange = vi.fn();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ code: 'JFK', name: 'John F. Kennedy International Airport' }],
    });

    render(
      <AutocompleteInput label="Departure Airport" value="" onChange={handleChange} fetchUrl="/api/users/autocomplete" name="dep" />
    );

    fireEvent.change(screen.getByPlaceholderText('Departure Airport'), { target: { value: 'jfk' } });

    expect(global.fetch).toHaveBeenCalledWith('/api/users/autocomplete?query=jfk');
    await waitFor(() => {
      expect(screen.getByText(/John F. Kennedy International Airport/)).toBeInTheDocument();
    });
  });

  it('selects a suggestion, reports it through onChange, and clears the list', async () => {
    const handleChange = vi.fn();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ code: 'JFK', name: 'John F. Kennedy International Airport' }],
    });

    render(
      <AutocompleteInput label="Departure Airport" value="" onChange={handleChange} fetchUrl="/api/users/autocomplete" name="dep" />
    );

    fireEvent.change(screen.getByPlaceholderText('Departure Airport'), { target: { value: 'jfk' } });
    const suggestion = await screen.findByText(/John F. Kennedy International Airport/);
    fireEvent.mouseDown(suggestion);

    expect(handleChange).toHaveBeenLastCalledWith({ target: { name: 'dep', value: 'JFK' } });
    expect(screen.queryByText(/John F. Kennedy International Airport/)).not.toBeInTheDocument();
  });

  it('silently clears suggestions when the fetch fails', async () => {
    const handleChange = vi.fn();
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    render(
      <AutocompleteInput label="Departure Airport" value="" onChange={handleChange} fetchUrl="/api/users/autocomplete" name="dep" />
    );

    fireEvent.change(screen.getByPlaceholderText('Departure Airport'), { target: { value: 'jfk' } });

    await waitFor(() => {
      expect(screen.queryByText(/John F. Kennedy/)).not.toBeInTheDocument();
    });
  });
});
