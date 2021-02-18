import React, { useState, useEffect } from "react";
import "./App.css";
import StarIcon from "@material-ui/icons/Star";

function App() {
  const colors = {
    available: "rgb(179, 204, 230)",
    used: "lightcoral",
    wrong: "red",
    candidate: "deepskyblue",
  };

  const utils = {
    sum: (arr) => arr.reduce((acc, curr) => acc + curr, 0),

    range: (min, max) =>
      Array.from({ length: max - min + 1 }, (_, i) => min + i),

    random: (min, max) => min + Math.floor(max * Math.random()),

    randomSumIn: (arr, max) => {
      const sets = [[]];
      const sums = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0, len = sets.length; j < len; j++) {
          const candidateSet = sets[j].concat(arr[i]);
          const candidateSum = utils.sum(candidateSet);
          if (candidateSum <= max) {
            sets.push(candidateSet);
            sums.push(candidateSum);
          }
        }
      }
      return sums[utils.random(0, sums.length - 1)];
    },
  };

  const Game = (props) => {
    const {
      stars,
      availableNums,
      candidateNums,
      secondsLeft,
      setGameState,
    } = useGameState();

    const candidatesAreWrong = utils.sum(candidateNums) > stars;
    const gameStatus =
      availableNums.length === 0
        ? "won"
        : secondsLeft === 0
        ? "lost"
        : "active";

    const StarsDisplay = (props) => (
      <>
        {utils.range(1, props.count).map((starId) => (
          <StarIcon key={starId} className="star" />
        ))}
      </>
    );

    const PlayNumber = (props) => {
      return (
        <button
          className="game__digits-digit"
          type="submit"
          onClick={() => props.onClick(props.number, props.status)}
          style={{ backgroundColor: colors[props.status] }}
        >
          {props.number}
        </button>
      );
    };

    const PlayAgain = (props) => (
      <div className="game__done">
        <div
          className="message"
          style={{ color: props.gameStatus === "won" ? "green" : "red" }}
        >
          {props.gameStatus === "won" ? "Grattis! Du vann!" : "Game Over!"}
        </div>
        <button className="reset" onClick={props.onClick}>
          Spela igen
        </button>
      </div>
    );
    const numberStatus = (number) => {
      if (!availableNums.includes(number)) {
        return "used";
      }
      if (candidateNums.includes(number)) {
        return candidatesAreWrong ? "wrong" : "candidate";
      }
      return "available";
    };

    const onNumberClick = (number, currentStatus) => {
      if (gameStatus !== "active" || currentStatus === "used") {
        return;
      }
      const newCandidateNums =
        currentStatus === "available"
          ? candidateNums.concat(number)
          : candidateNums.filter((cn) => cn !== number);
      setGameState(newCandidateNums);
    };

    return (
      <div className="app">
        <h1>The Star Match Game</h1>
        <div className="help">
          <h3>
            Välj ett eller flera tal, som tillsammans ger summan av antalet
            stjärnor som visas!
          </h3>
        </div>
        <div className="game">
          <div className="game__stars">
            <div className="container">
              {gameStatus !== "active" ? (
                <PlayAgain
                  onClick={props.startNewGame}
                  gameStatus={gameStatus}
                />
              ) : (
                <StarsDisplay count={stars} />
              )}
            </div>
          </div>
          <div className="game__digits">
            <div className="container">
              {utils.range(1, 9).map((number) => (
                <PlayNumber
                  key={number}
                  status={numberStatus(number)}
                  number={number}
                  onClick={onNumberClick}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="time">
          <h3>
            Återstående tid: <b>{secondsLeft}</b> sekunder
          </h3>
        </div>
      </div>
    );
  };

  const useGameState = () => {
    const [stars, setStars] = useState(utils.random(1, 9));
    const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
    const [candidateNums, setCandidateNums] = useState([]);
    const [secondsLeft, setSecondsLeft] = useState(10);

    useEffect(() => {
      if (secondsLeft > 0 && availableNums.length > 0) {
        const timerId = setTimeout(() => {
          setSecondsLeft(secondsLeft - 1);
        }, 1000);
        return () => clearTimeout(timerId);
      }
    });

    const setGameState = (newCandidateNums) => {
      if (utils.sum(newCandidateNums) !== stars) {
        setCandidateNums(newCandidateNums);
      } else {
        const newAvailableNums = availableNums.filter(
          (n) => !newCandidateNums.includes(n)
        );
        setStars(utils.randomSumIn(newAvailableNums, 9));
        setAvailableNums(newAvailableNums);
        setCandidateNums([]);
      }
    };
    return { stars, availableNums, candidateNums, secondsLeft, setGameState };
  };

  const StarMatch = () => {
    const [gameId, setGameId] = useState(1);
    return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />;
  };
  return <StarMatch />;
}

export default App;
