import { useEffect, useState } from 'react';

const EC2_IP = import.meta.env.VITE_API_IP;

interface Country {
    name: string;
    code: string;
}

const FlagPractice = () => {
    const [flag, setFlag] = useState<Country | null>(null);
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [gaveUp, setGaveUp] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [submittedGuess, setSubmittedGuess] = useState('');
    const [previousAnswer, setPreviousAnswer] = useState<string | null>(null);

    function fetchRandomFlag() {
        setError(null);
        setInputValue('');
        setSubmittedGuess('');

        fetch(`http://${EC2_IP}:3000/flag/random`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not OK');
                return res.json();
            })
            .then(data => {
                setFlag(data);
            })
            .catch(err => {
                setError(err.message);
            });
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!flag) return;

        setPreviousAnswer(null);

        const guess = inputValue.trim();
        const guessLower = guess.toLowerCase();
        const answer = flag.name.trim().toLowerCase().normalize('NFD');

        setSubmittedGuess(guess);
        setIsCorrect(guessLower === answer);
        setSubmitted(true);
        setGaveUp(false);

        if (guessLower === answer) {
            setPreviousAnswer(flag.name);
            fetchRandomFlag();
        }
    }

    useEffect(() => {
        fetchRandomFlag();
    }, []);

    function handleGiveUp() {
        if (!flag) return;

        setPreviousAnswer(flag.name);
        setSubmittedGuess('');
        setIsCorrect(false);
        setGaveUp(true);
        setSubmitted(false);

        fetchRandomFlag();
    }

    return (
        <>
            <div>
                <h2>Which country's flag is this?</h2>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {flag ? (

                    <div>
                        <img
                            src={`https://flagcdn.com/h240/${flag.code}.png`}
                        />
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder="answer"
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

                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
    );
};

export default FlagPractice;
