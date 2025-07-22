import { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import './App.css';

interface Player {
  native: string;
  latin: string;
}

function Transliteration() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [submittedGuess, setSubmittedGuess] = useState('');
  const [previousAnswer, setPreviousAnswer] = useState<string | null>(null);

  function fetchRandomPlayer() {
    setError(null);
    setInputValue('');
    setSubmittedGuess('');

    fetch(`${API_BASE_URL}/player/random`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not OK');
        return res.json();
      })
      .then(data => {
        setPlayer(data);
      })
      .catch(err => {
        setError(err.message);
      });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!player) return;

    setPreviousAnswer(null);

    const guess = inputValue.trim();
    const guessLower = guess.toLowerCase();
    const answer = player.latin.trim().toLowerCase();

    setSubmittedGuess(guess);
    setIsCorrect(guessLower === answer);
    setSubmitted(true);
    setGaveUp(false);

    if (guessLower === answer) {
      setPreviousAnswer(player.latin);
      fetchRandomPlayer();
    }
  }

  function handleGiveUp() {
    if (!player) return;

    setPreviousAnswer(player.latin);
    setSubmittedGuess('');
    setIsCorrect(false);
    setGaveUp(true);
    setSubmitted(false);

    fetchRandomPlayer();
  }

  useEffect(() => {
    fetchRandomPlayer();
  }, []);

  return (
    <>
      <div style={{ marginTop: '1rem' }}>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {player && (
          <div>
            <p className="playerName">{player.native}</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="transliteration"
              />
              <button className="submitButton" type="submit">Submit</button>
            </form>
            {(submitted || previousAnswer) && (
              isCorrect ? (
                <p className="right response">{previousAnswer} was correct</p>
              ) : gaveUp ? (
                <p className="wrong response">The correct answer was <strong>{previousAnswer}</strong></p>
              ) : (
                <p className="wrong response">{submittedGuess} is incorrect</p>
              )
            )}
            <button className="giveUpButton" onClick={handleGiveUp}>Give Up</button>
          </div>
        )}
      </div>
    </>
  );
}

export default Transliteration;
