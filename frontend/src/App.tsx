import { useState } from 'react';
import './App.css'

interface Location {
  name: string;
  lat: number;
  lon: number;
}

function App() {
  const [pos, setPos] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function fetchPos() {
    setLoading(true);
    setError(null);

    fetch('http://localhost:8080/location/NewYork')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not OK');
        }
        return res.json();
      })
      .then(data => {
        setPos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  return (
    <>
      <button onClick={fetchPos}>Get Location</button>
      <div style={{ marginTop: '1rem' }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {pos && (
          <p>
            Location: {pos.name} <br />
            Latitude: {pos.lat} <br />
            Longitude: {pos.lon}
          </p>
        )}
      </div>
    </>
  )
}

export default App
