"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { animals, cities, carBrands, drinks } from "./categories";

interface GameStateProps {
  wins: number;
  loss: number;
  skips: number;
  currentWord?: string;
}

// Function to get info from local storage
const getObjectFromLocalStorage = (): GameStateProps => {
  try {
    const item = localStorage.getItem("wordman");
    return item
      ? (JSON.parse(item) as GameStateProps)
      : { wins: 0, loss: 0, skips: 0, currentWord: undefined };
  } catch (error) {
    console.error("Error retrieving from local storage", error);
    return { wins: 0, loss: 0, skips: 0, currentWord: undefined };
  }
};

// Function to save info to local storage
const saveObjectToLocalStorage = (key: string, value: GameStateProps): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to local storage", error);
  }
};

const categories = [
  { id: 1, category: "Animals", array: animals },
  { id: 2, category: "Cities", array: cities },
  { id: 3, category: "Car Brands", array: carBrands },
  { id: 4, category: "Drinks", array: drinks },
];

const randomWord = () => {
  const selected = categories[Math.floor(Math.random() * categories.length)];
  const selectedCategory = selected.category;
  const selectedWord =
    selected.array[
      Math.floor(Math.random() * selected.array.length)
    ].toLowerCase();
  return {
    selectedCategory,
    selectedWord,
  };
};

const areSetsEqual = <T,>(set1: Set<T>, set2: Set<T>): boolean => {
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
};

const Wordman = () => {
  const [curWord, setCurWord] = useState("");
  const [curWordSet, setCurWordSet] = useState(new Set<string>());
  const [wins, setWins] = useState(0);
  const [loss, setLoss] = useState(0);
  const [skips, setSkips] = useState(0);
  const [hints, setHints] = useState(0);
  const [category, setCategory] = useState("");
  const [incorrect, setIncorrect] = useState(0);
  const [gameStart, setGameStart] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);
  const [gameState, setGameState] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [guesses, setGuesses] = useState<Set<string>>(new Set());
  const [correctGuesses, setCorrectGuesses] = useState<Set<string>>(new Set());

  const maxIncorrect = 12;

  useEffect(() => {
    const gameScore = getObjectFromLocalStorage();
    setWins(gameScore.wins);
    setLoss(gameScore.loss);
    setSkips(gameScore.skips);
    if (gameScore.currentWord) {
      setCurWord(gameScore.currentWord);
      setCurWordSet(new Set(gameScore.currentWord.toLowerCase()));
    } else {
      getNewWord();
    }
    setGameState(true);
  }, []);

  useEffect(() => {
    if (gameState) {
      saveObjectToLocalStorage("wordman", {
        wins,
        loss,
        skips,
        currentWord: curWord,
      });
    }
  }, [wins, loss, skips, gameState, curWord]);

  function handleKeyInput(key: string) {
    if (gameStart) {
      if (/^[a-z]$/.test(key) && !guesses.has(key)) {
        setGuesses((prevGuesses) => new Set([...prevGuesses, key]));
        if (curWordSet.has(key)) {
          setCorrectGuesses((prevGuesses) => new Set([...prevGuesses, key]));
        } else {
          setIncorrect((prevIncorrect) => prevIncorrect + 1);
        }
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      handleKeyInput(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [curWordSet, guesses, gameStart]);

  useEffect(() => {
    if (incorrect === maxIncorrect && gameStart) {
      setLoss((prevLoss) => prevLoss + 1);
      setGameStart(false);
      setGameEnd(true);
    } else if (areSetsEqual(curWordSet, correctGuesses) && gameStart) {
      setWins((prevWins) => prevWins + 1);
      setGameStart(false);
      setGameEnd(true);
      setGameWin(true);
    }
  }, [incorrect, correctGuesses, curWordSet, gameStart]);

  const getNewWord = useCallback(() => {
    const { selectedWord, selectedCategory } = randomWord();
    setCategory(selectedCategory);
    setCurWord(selectedWord);
    setCurWordSet(new Set(selectedWord.toLowerCase()));

    const hintsGiven = Math.max(selectedWord.length - 4, 0);
    setHints(Math.min(hintsGiven, 3));
    setGameStart(true);
    setGameEnd(false);
  }, []);

  const skipWord = () => {
    setSkips((prevSkips) => prevSkips + 1);
    restartGame();
  };
  const hintWord = () => {
    if (hints) {
      setHints((prevHints) => prevHints - 1);

      // Get random remaining key from curWordSet && correctGuesses
      const difference = Array.from(curWordSet).filter(
        (item) => !correctGuesses.has(item),
      );

      if (difference.length > 0) {
        const randomIndex = Math.floor(Math.random() * difference.length);
        const randomString = difference[randomIndex];
        console.log(randomString); // This will print a random string from the difference array
        handleKeyInput(randomString);
      } else {
        console.log("No difference found");
      }
    }
  };

  const restartGame = () => {
    setIncorrect(0);
    setCorrectGuesses(new Set());
    setGuesses(new Set());
    setGameWin(false);
    getNewWord();
    setGameStart(true);
    setGameEnd(false);
  };

  const wordBoxes = useMemo(
    () =>
      Array.from(curWord, (char, index) => (
        <div
          key={index}
          className="grid aspect-square h-12 w-10 place-items-center rounded-md bg-indigo-600 font-raleway text-white shadow-inner shadow-indigo-950"
        >
          <span
            className={`${guesses.has(char) ? "opacity-100 duration-300" : "opacity-0 duration-0"} select-none uppercase`}
          >
            {char}
          </span>
        </div>
      )),
    [curWord, guesses],
  );

  const incorrectCircles = useMemo(
    () =>
      Array.from({ length: maxIncorrect }, (_, index) => (
        <div key={index} className="flex items-center justify-center">
          <div
            className={`aspect-square w-20 rounded-full bg-red-500 ${index + 1 <= incorrect ? "opacity-100" : "opacity-10"}  duration-300`}
          ></div>
        </div>
      )),
    [incorrect, maxIncorrect],
  );
  const keyboardCharacters = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];
  const keyboardLayout = (
    <div className="w-full gap-1">
      {keyboardCharacters.map((row, rowIndex) => (
        <div key={rowIndex} className="flex items-center justify-center">
          {row.map((char, index) => (
            <button
              type="button"
              key={index}
              onClick={() => {
                handleKeyInput(char.toLowerCase());
              }}
              className={`m-1 grid aspect-square h-8 w-6 place-items-center rounded-md bg-indigo-600 font-raleway text-xs text-white shadow-md shadow-indigo-300 sm:h-12 sm:w-10 sm:text-base ${guesses.has(char.toLowerCase()) ? "cursor-not-allowed opacity-50" : gameStart ? "opacity-100 hover:bg-indigo-500" : "cursor-default opacity-100"} duration-300`}
            >
              <span className={`uppercase`}>{char}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-6">
      <div className="order-2 col-span-1 flex h-full flex-col items-center justify-start md:order-1 md:col-span-4">
        <div className="h-full w-full max-w-xl rounded-md bg-indigo-50 px-5 py-3 shadow-xl">
          <div className="flex items-center justify-center gap-4">
            <div className="flex w-fit flex-col items-center justify-center gap-1 rounded-md bg-indigo-300 px-10 py-4">
              <div className="text-5xl font-bold">{wins}</div>
              <div className="text-xl">Wins</div>
            </div>
            <div className="flex w-fit flex-col items-center justify-center gap-1 rounded-md bg-red-300 px-10 py-4">
              <div className="text-5xl font-bold">{loss}</div>
              <div className="text-xl">Loss</div>
            </div>
          </div>
          <div className="my-3 flex items-center justify-center gap-3">
            <div className="w-fit rounded-full border border-slate-400 bg-indigo-200 px-3 py-1 text-sm">
              <span className="font-semibold">Skipped</span> {skips}
            </div>
            <div className="w-fit rounded-full border border-slate-400 bg-indigo-200 px-3 py-1 text-sm">
              <span className="font-semibold">Hints</span> {hints}
            </div>
          </div>
          {!gameStart && gameState && (
            <div className="my-3 grid place-items-center">
              <button
                type="button"
                onClick={restartGame}
                className="rounded-xl bg-indigo-500 px-5 py-2 font-semibold text-white duration-300 hover:bg-indigo-600 active:scale-95"
              >
                {gameEnd ? "New Game" : "Start"}
              </button>
            </div>
          )}
          {gameState && gameStart && (
            <div className="my-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={skipWord}
                className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-white duration-300 hover:bg-yellow-500 active:scale-95"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={hintWord}
                disabled={hints === 0}
                className={`rounded-xl bg-amber-700 px-5 py-2 font-semibold text-white duration-300  ${hints > 0 ? "hover:bg-amber-600 active:scale-95" : "cursor-not-allowed opacity-50"}`}
              >
                Hint
              </button>
            </div>
          )}
          {(gameStart || gameEnd) && (
            <div className="mb-5 flex items-center justify-center gap-2 text-xl">
              Category: <span className="font-semibold">{category}</span>
            </div>
          )}
          {(gameStart || gameEnd) && (
            <div className="flex items-center justify-center gap-2">
              {wordBoxes}
            </div>
          )}
          {!gameStart && gameEnd && gameState && (
            <div className="mt-5 flex items-center justify-center">
              <div
                className={`flex w-fit flex-col items-center justify-center rounded-md bg-indigo-200 px-4 py-2`}
              >
                <div className="text-sm">
                  {gameWin
                    ? "Yay! You have Won"
                    : "You have Lost. Let's try again!"}
                </div>
                <div>
                  The word is{" "}
                  <span className="font-semibold uppercase">{curWord}</span>
                </div>
              </div>
            </div>
          )}
          {/* Keyboard section */}
          <div className="my-5 border-t-2 border-slate-300 pt-4">
            {keyboardLayout}
          </div>
          {/* Debug section */}
          {false && (
            <>
              <div>Wins: {wins}</div>
              <div>Loss: {loss}</div>
              <div>Skips: {skips}</div>
              <div>Guesses: {Array.from(guesses).join(", ")}</div>
              <div>Incorrect: {incorrect}</div>
              <div>Max Incorrect: {maxIncorrect}</div>
              <div className="flex gap-3">
                <h1>Current word:</h1>
                <span className="uppercase">{curWord}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="order-1 col-span-1 flex h-fit w-full flex-col items-center justify-start gap-5 rounded-md bg-indigo-50 p-5 shadow-xl md:order-2 md:col-span-2">
        <div>
          Guesses left:{" "}
          <span className="font-semibold">{maxIncorrect - incorrect}</span>
        </div>
        <div className="grid w-full grid-cols-6 gap-5 bg-indigo-50 md:grid-cols-3">
          {incorrectCircles}
        </div>
      </div>
    </div>
  );
};

export default Wordman;
