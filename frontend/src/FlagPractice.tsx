import { useEffect, useState } from 'react';
import { CountryDropdown } from './components/FlagHelpers';

const EC2_IP = import.meta.env.VITE_API_IP;

interface Country {
    code: string;
    name: string[];
}

const FlagPractice = () => {
    const [category, setCategory] = useState('');
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

        fetch(`http://${EC2_IP}:3000/flag/random?category=${category}`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not OK');
                return res.json();
            })
            .then(data => {
                // console.log('Flag data:', data);
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
        const names = normalizeNames(flag.name);

        const normalizedGuess = inputValue.trim().toLowerCase().normalize('NFD').replace('&', "and");

        // console.log("Normalized guess:", normalizedGuess);
        // console.log("Normalized names:", names.map(n => n.trim().toLowerCase().normalize('NFD')));

        const isCorrect = names.some(n =>
            n.trim().toLowerCase().normalize('NFD') === normalizedGuess
        );

        setSubmittedGuess(guess);
        setIsCorrect(isCorrect);
        setSubmitted(true);
        setGaveUp(false);

        if (isCorrect) {
            setPreviousAnswer(names[0]);
            fetchRandomFlag();
        }
    }

    function normalizeNames(name: string | string[] | undefined): string[] {
        if (!name) return [];
        return Array.isArray(name) ? name : [name];
    }

    useEffect(() => {
        fetchRandomFlag();
    }, [category]);

    function handleGiveUp() {
        if (!flag) return;

        setPreviousAnswer(flag.name[0]);
        setSubmittedGuess('');
        setIsCorrect(false);
        setGaveUp(true);
        setSubmitted(false);

        fetchRandomFlag();
    }

    return (
        <>
            <div>
                <CountryDropdown
                    selected={category}
                    onChange={(value) => {
                        setCategory(value);
                    }}
                />
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