import { useEffect, useState } from 'react';
import { CategoryDropdown, ModeDropdown } from './components/FlagHelpers';
import type { CategoryOption, ModeOption } from './components/FlagHelpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Country {
    code: string;
    name: string[];
}

const FlagPractice = () => {
    const [category, setCategory] = useState<CategoryOption>({ value: 'countries', name: "Countries", tag: "country's" });
    const [options, setOptions] = useState<string[]>([]);
    const [mode, setMode] = useState<ModeOption>({ value: 'typed', name: "Typed" });
    const [flag, setFlag] = useState<Country | null>(null);
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [gaveUp, setGaveUp] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [submittedGuess, setSubmittedGuess] = useState('');
    const [previousAnswer, setPreviousAnswer] = useState<string | null>(null);
    const [multipleChoiceGuesses, setMultipleChoiceGuesses] = useState(2);
    const [streak, setStreak] = useState(0);

    function fetchRandomFlag() {
        setError(null);
        setInputValue('');
        setSubmittedGuess('');

        fetch(`${API_BASE_URL}/flag/random?category=${category.value}`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not OK');
                return res.json();
            })
            .then(data => {
                // console.log('Flag data:', data);
                setFlag(data);
                const correct = normalizeNames(data.name)[0];
                if (mode.value != 'typed') {
                    buildOptions(correct);
                }
            })
            .catch(err => {
                setError(err.message);
            });
    }

    async function buildOptions(correct: string) {
        // select 3 wrong options while rejecting dupes
        const wrongs: Set<string> = new Set();
        while (wrongs.size < 3) {
            while (wrongs.size < 3) {
                try {
                    const res = await fetch(`${API_BASE_URL}/flag/random?category=${category.value}`);
                    if (!res.ok) throw new Error('Network response was not OK');

                    const data = await res.json();
                    const name = normalizeNames(data.name)[0];

                    if (normalizeText(name) !== normalizeText(correct)) {
                        wrongs.add(name);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }

        const all = [...wrongs, correct];
        // shuffle in‑place
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }
        setOptions(all);
    }

    function handleTypedSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!flag) return;

        setPreviousAnswer(null);

        const guess = inputValue.trim();
        const names = normalizeNames(flag.name);
        const normalizedGuess = normalizeText(guess);
        const isCorrect = names.some(n => normalizeText(n) === normalizedGuess);

        setSubmittedGuess(guess);
        setIsCorrect(isCorrect);
        setSubmitted(true);
        setGaveUp(false);

        if (isCorrect) {
            setStreak(prev => prev + 1);
            setPreviousAnswer(names[0]);
            fetchRandomFlag();
        } else {
            setStreak(0);
        }
        setInputValue("");
    }

    function handleChoiceSubmit(choice: string) {
        if (!flag) return;

        console.log(choice)

        const names = normalizeNames(flag.name);
        const isCorrect = names[0] == choice;

        setSubmittedGuess(choice);
        setIsCorrect(isCorrect);
        setSubmitted(true);
        setGaveUp(false);

        if (isCorrect) {
            setStreak(prev => prev + 1);
            setPreviousAnswer(names[0]);
            setMultipleChoiceGuesses(2);
            fetchRandomFlag();
        } else if (multipleChoiceGuesses > 1) {
            setOptions(options.filter(option => option !== choice));
            setMultipleChoiceGuesses(prev => prev - 1);
            setStreak(0);
        } else {
            setStreak(0);
            setMultipleChoiceGuesses(2);
            handleGiveUp();
        }
        console.log(multipleChoiceGuesses);
    }

    function normalizeNames(name: string | string[] | undefined): string[] {
        if (!name) return [];
        return Array.isArray(name) ? name : [name];
    }

    function normalizeText(str: string): string {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace('&', 'and')
            .toLowerCase()
            .trim();
    }

    useEffect(() => {
        fetchRandomFlag();
    }, [category]);

    useEffect(() => {
        if (flag && mode.value !== 'typed') {
            const correct = normalizeNames(flag.name)[0];
            buildOptions(correct);
        }
    }, [mode, flag]);

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
                <CategoryDropdown
                    selected={category}
                    onChange={(value: CategoryOption) => setCategory(value)}
                />
                <ModeDropdown
                    selected={mode}
                    onChange={(value: ModeOption) => setMode(value)}
                />
                <h2>Which {category.tag} flag is this?</h2>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {flag ? (
                    <div>
                        <img
                            src={`https://flagcdn.com/h240/${flag.code}.png`}
                        />
                        {(mode.value == 'typed') ?
                            <form onSubmit={handleTypedSubmit}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder="answer"
                                />
                                <button className="submitButton" type="submit">Submit</button>
                            </form>
                            : <div>{options.map(opt => (
                                <button
                                    key={opt}
                                    className="option"
                                    type="button"
                                    onClick={() => {
                                        handleChoiceSubmit(opt);
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                            </div>
                        }
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
                        <p>Streak: {streak}</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
    );
};

export default FlagPractice;