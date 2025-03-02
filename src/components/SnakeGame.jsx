import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1a1a1a;
  min-height: 100vh;
  padding: 2rem;
  color: #fff;
  font-family: 'Arial', sans-serif;
`;

const ScoreBoard = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 25px);
  grid-template-rows: repeat(20, 25px);
  gap: 1px;
  background: #2a2a2a;
  padding: 5px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
`;

const Cell = styled.div`
  width: 25px;
  height: 25px;
  background: ${props => props.snake ? '#4CAF50' : props.food ? '#FF4081' : '#333'};
  border-radius: ${props => props.food ? '50%' : '3px'};
  transition: all 0.1s ease;
  transform: ${props => props.head ? 'scale(1.1)' : 'scale(1)'};
`;

const Controls = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  background: #4CAF50;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  
  &:hover {
    background: #45a049;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
  }
`;

const SettingsPanel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(42, 42, 42, 0.95);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`;

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(150);

  const generateFood = useCallback(() => ({
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  }), []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setIsRunning(true);
  };

  const checkCollision = useCallback((head) => {
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) return true;
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (!isRunning || gameOver) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
      }

      if (checkCollision(head)) {
        setGameOver(true);
        setIsRunning(false);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeHighScore', score);
        }
        return prevSnake;
      }

      newSnake.unshift(head);
      
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food.x, food.y, checkCollision, isRunning, gameOver, score, highScore, generateFood]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('snakeHighScore');
    if (storedHighScore) setHighScore(parseInt(storedHighScore));
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  return (
    <GameContainer>
      <ScoreBoard>
        <div>Score: {score}</div>
        <div>High Score: {highScore}</div>
      </ScoreBoard>

      <GameGrid>
        {Array.from({ length: 20 * 20 }).map((_, i) => {
          const x = i % 20;
          const y = Math.floor(i / 20);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;
          const isHead = snake[0].x === x && snake[0].y === y;

          return (
            <Cell
              key={i}
              snake={isSnake}
              food={isFood}
              head={isHead}
            />
          );
        })}
      </GameGrid>

      <Controls>
        <Button onClick={resetGame} disabled={isRunning && !gameOver}>
          {gameOver ? 'Game Over! Play Again' : isRunning ? 'Restart' : 'Start Game'}
        </Button>
        <Button onClick={() => setShowSettings(!showSettings)}>
          Settings
        </Button>
      </Controls>

      {showSettings && (
        <SettingsPanel>
          <h3>Settings</h3>
          <label>
            Speed:
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              <option value={200}>Slow</option>
              <option value={150}>Normal</option>
              <option value={100}>Fast</option>
            </select>
          </label>
        </SettingsPanel>
      )}
    </GameContainer>
  );
};

export default SnakeGame;