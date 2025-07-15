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
    const [longestStreak, setLongestStreak] = useState(0);
    const [allFlags, setAllFlags] = useState<Country[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);

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

        if (!started) setStarted(true);

        const guess = inputValue.trim();
        const names = normalizeNames(flag.name);
        const normalizedGuess = normalizeText(guess);
        const isCorrect = names.some(n => normalizeText(n) === normalizedGuess);

        setSubmittedGuess(guess);
        setIsCorrect(isCorrect);
        setSubmitted(true);
        setGaveUp(false);

        if (isCorrect) {
            setStreak(prev => {
                const newStreak = prev + 1;
                setLongestStreak(ls => Math.max(ls, newStreak));
                return newStreak;
            });
            setPreviousAnswer(names[0]);
            if (practice.value == 0) {
                setCorrect(prev => prev + 1);
                nextFlag();
            } else {
                fetchRandomFlag();
            }
        } else {
            setStreak(0);
            if (practice.value == 0) {
                setPreviousAnswer(names[0]);
                setIncorrect(prev => prev + 1);
                setGaveUp(true);
                nextFlag();
            }
        }
        setInputValue("");
    }

    function handleChoiceSubmit(choice: string) {
        if (!flag) return;
        if (!started) setStarted(true);

        console.log(choice)

        const names = normalizeNames(flag.name);
        const isCorrect = names[0] == choice;

        setSubmittedGuess(choice);
        setIsCorrect(isCorrect);
        setSubmitted(true);
        setGaveUp(false);

        if (isCorrect) {
            setStreak(prev => {
                const newStreak = prev + 1;
                setLongestStreak(ls => Math.max(ls, newStreak));
                return newStreak;
            });
            setPreviousAnswer(names[0]);
            setMultipleChoiceGuesses(2);
            if (practice.value == 0) {
                setCorrect(prev => prev + 1);
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
                setIncorrect(prev => prev + 1);
                setGaveUp(true);
                nextFlag();
            } else {
                handleGiveUp();
            }
        }
        console.log(multipleChoiceGuesses);
    }

    function handleGiveUp() {
        if (!flag) return;

        if (streak > longestStreak) {
            setLongestStreak(streak);
        }
        setStreak(0);
        setPreviousAnswer(flag.name[0]);
        setSubmittedGuess('');
        setIsCorrect(false);
        setGaveUp(true);
        setSubmitted(false);
        if (practice.value == 1) {
            fetchRandomFlag();
        } else {
            setIncorrect(prev => prev + 1);
            nextFlag();
        }
    }

    function playNormalMode() {
        setElapsed(0);
        setIncorrect(0);
        setCorrect(0);
        setStreak(0);
        setLongestStreak(0);
        setStarted(false);
        setFinished(false);
        setSubmitted(false);
        setError(null);
        setInputValue('');
        setSubmittedGuess('');
        setPreviousAnswer('');

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
        } else {
            setFinished(true);
        }
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
            .replace('st', 'saint')
            .toLowerCase()
            .trim();
    }

    function formatTime(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = ms % 1000;

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
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

    // Timer
    useEffect(() => {
        if (!started || finished) return;

        const startTime = Date.now();

        const interval = setInterval(() => {
            setElapsed(Date.now() - startTime);
        }, 50); // update every 50ms

        return () => clearInterval(interval);
    }, [started, finished]);


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
                        {(!finished && mode.value == 'typed') ?
                            <form onSubmit={handleTypedSubmit}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder="answer"
                                />
                                <button className="submitButton" type="submit">Submit</button>
                            </form>
                            : (!finished && (<div>{options.map(opt => (
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
                            </div>)
                            )}
                        {(submitted || previousAnswer) && (
                            isCorrect ? (
                                <p className="right response">{previousAnswer} was correct</p>
                            ) : gaveUp ? (
                                <p className="wrong response">The correct answer was <strong>{previousAnswer}</strong></p>
                            ) : (
                                <p className="wrong response">{submittedGuess} is incorrect</p>
                            )
                        )}
                        {!finished ?
                            <button className="giveUpButton" onClick={handleGiveUp}>Give Up</button>
                            : <button className="restartButton" onClick={playNormalMode}>Restart</button>
                        }
                        <div className="roundInfo">
                            Streak: {streak} <br />
                            Correct: {correct} <br />
                            Incorrect: {incorrect} <br />
                            Longest Streak: {longestStreak} <br />
                            Time: {formatTime(elapsed)} <br />
                        </div>

                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
    );
};

export default FlagPractice;