import React, { useState } from 'react';
import '../styles/Autocomplete.css'; 

const AutocompleteInput = ({ label, value, onChange, fetchUrl, name, required = false }) => {
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    if (!newValue.trim()) {
      setSuggestions([]);
      return;
    }

    if (newValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    fetch(`${fetchUrl}?query=${encodeURIComponent(newValue)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => setSuggestions(data))
      .catch(() => {
        // Fail silently — no console.error here
        setSuggestions([]);
      });
  };

  const handleSelect = (code) => {
    onChange({ target: { name, value: code } });
    setSuggestions([]);
  };

  return (
    <div
      className="autocomplete-wrapper"
      onBlur={() => setTimeout(() => setSuggestions([]), 100)}
    >
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={label}
        required={required}
        autoComplete="off"
        className="form-control"
      />
      {suggestions.length > 0 && (
        <div className="autocomplete-suggestions">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="suggestion-item"
              onMouseDown={() => handleSelect(s.code)}
            >
              {s.name} ({s.code})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
