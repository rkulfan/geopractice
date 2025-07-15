import { useEffect, useState } from 'react';
import { CategoryDropdown, ModeDropdown, PracticeDropdown } from './components/FlagHelpers';
import type { CategoryOption, ModeOption, PracticeOption } from './components/FlagHelpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Country {
    code: string;
    name: string[];
}

const FlagPractice = () => {
    const [category, setCategory] = useState<CategoryOption>({ value: 'countries', name: "Countries", tag: "country's" });
    const [mode, setMode] = useState<ModeOption>({ value: 'typed', name: "Typed" });
    const [practice, setPractice] = useState<PracticeOption>({ value: 0, name: "Practice" });
    const [options, setOptions] = useState<string[]>([]);
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
    const [correct, setCorrect] = useState(0);
    const [incorrect, setIncorrect] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [allFlags, setAllFlags] = useState<Country[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    function buildOptions(correct: string) {
        if (!allFlags.length) return;

        const wrongOptions = allFlags
            .filter(f => normalizeText(f.name[0]) !== normalizeText(correct))
            .map(f => f.name[0]);

        const selectedWrongs: string[] = [];
        while (selectedWrongs.length < 3 && wrongOptions.length > 0) {
            // pick a random wrong option and remove it from the pool
            const idx = Math.floor(Math.random() * wrongOptions.length);
            selectedWrongs.push(wrongOptions[idx]);
            wrongOptions.splice(idx, 1);
        }

        const all = [...selectedWrongs, correct];

        // shuffle in place
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
            if (practice.value == 0) {
                setCorrect(correct + 1);
                nextFlag();
            } else {
                fetchRandomFlag();
            }
        } else {
            setStreak(0);
            if (practice.value == 0) {
                setPreviousAnswer(names[0]);
                setIncorrect(incorrect + 1);
                nextFlag();
            }
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
            if (practice.value == 0) {
                setCorrect(correct + 1);
                nextFlag();
            } else {
                fetchRandomFlag();
            }
        } else if (practice.value == 1 && multipleChoiceGuesses > 1) {
            setOptions(options.filter(option => option !== choice));
            setMultipleChoiceGuesses(prev => prev - 1);
            setStreak(0);
        } else {
            setStreak(0);
            setMultipleChoiceGuesses(2);
            if (practice.value == 0) {
                setPreviousAnswer(names[0]);
                setIncorrect(incorrect + 1);
                nextFlag();
            } else {
                handleGiveUp();
            }
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

    function playNormalMode() {
        setIncorrect(0);
        setCorrect(0);

        fetch(`${API_BASE_URL}/flag/all?category=${category.value}`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not OK');
                return res.json();
            })
            .then(data => {
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }
                setAllFlags(data);
                setCurrentIndex(0);
                setFlag(data[0]);
                if (mode.value !== 'typed') {
                    const correct = normalizeNames(data[0].name)[0];
                    buildOptions(correct);
                }
            })
            .catch(err => {
                setError(err.message);
            });
    }


    function nextFlag() {
        const nextIndex = currentIndex + 1;
        if (nextIndex < allFlags.length) {
            setCurrentIndex(nextIndex);
            setFlag(allFlags[nextIndex]);
        }
    }

    useEffect(() => {
        if (practice.value) {
            fetchRandomFlag();
        } else {
            playNormalMode();
        }
    }, [category]);

    useEffect(() => {
        if (flag && mode.value !== 'typed') {
            const correct = normalizeNames(flag.name)[0];
            buildOptions(correct);
        }
    }, [mode, flag]);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [practice]);

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
                <PracticeDropdown
                    selected={practice}
                    onChange={
                        (value: PracticeOption) => {
                            setPractice(value);
                            if (practice.value == 0) {
                                playNormalMode();
                            }
                        }
                    }
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
                        {practice.value == 0 && <div>
                            <p>Correct: {correct}</p>
                            <p>Incorrect: {incorrect}</p>
                            <p>Time: {elapsed}</p>
                        </div>}

                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
    );
};

export default FlagPractice;