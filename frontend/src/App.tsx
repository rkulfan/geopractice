import { useEffect, useState } from 'react';
import './App.css'

interface Player {
  native: string,
  latin: string
}

function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function fetchPlayer() {
    setLoading(true);
    setError(null);
    setSubmitted(false); // reset on new player

    fetch('http://localhost:8080/player/Artemi_Panarin')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not OK');
        }
        return res.json();
      })
      .then(data => {
        setPlayer(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!player) return;

    const guess = inputValue.trim().toLowerCase();
    const answer = player.latin.trim().toLowerCase();

    setIsCorrect(guess === answer);
    setSubmitted(true);
  }

  useEffect(() => {
    fetchPlayer();
  }, []);

  return (
    <>
      <div style={{ marginTop: '1' }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {player && (
          <div>
            <p>{player.native}</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="transliteration"
              />
            </form>
            {submitted && (
              isCorrect ? <p className="right response">yes</p> : <p className="wrong response">no</p>
            )}
            <button onClick={fetchPlayer}>Give Up</button>
          </div>
        )}
      </div>
    </>
  )
}

export default App;
