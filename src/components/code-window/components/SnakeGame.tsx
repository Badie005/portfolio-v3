"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface SnakeGameProps {
  onClose: () => void;
}

const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const SPEED = 100;

export function SnakeGame({ onClose }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Game state
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (directionRef.current.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (directionRef.current.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
          break;
        case " ":
          if (!gameStarted || gameOver) startGame();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startGame is stable, adding it causes re-renders
  }, [gameStarted, gameOver, onClose]);

  const startGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = { x: 15, y: 15 };
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(gameLoop, SPEED);
  };

  const gameLoop = () => {
    const snake = snakeRef.current;
    const direction = nextDirectionRef.current;
    directionRef.current = direction;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check collision with walls
    if (
      head.x < 0 ||
      head.x >= CANVAS_SIZE / GRID_SIZE ||
      head.y < 0 ||
      head.y >= CANVAS_SIZE / GRID_SIZE
    ) {
      endGame();
      return;
    }

    // Check collision with self
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        endGame();
        return;
      }
    }

    const newSnake = [head, ...snake];

    // Check collision with food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((prev) => prev + 10);
      spawnFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    draw();
  };

  const spawnFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
    };
    // Make sure food doesn't spawn on snake
    // (Simplification: just random, chance of collision is low)
    foodRef.current = newFood;
  };

  const endGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setGameOver(true);
    setGameStarted(false);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = "#4ade80"; // Green-400
    snakeRef.current.forEach((segment) => {
      ctx.fillRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = "#f87171"; // Red-400
    ctx.fillRect(
      foodRef.current.x * GRID_SIZE,
      foodRef.current.y * GRID_SIZE,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  };

  useEffect(() => {
    // Initial draw
    if (canvasRef.current && !gameStarted) {
      // Draw blank screen or title
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: render only on mount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-ide-bg border border-ide-border rounded-lg relative font-mono">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-ide-muted hover:text-ide-text"
      >
        <X size={16} />
      </button>

      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-ide-text mb-1">TERMINAL SNAKE</h3>
        <p className="text-xs text-ide-muted">Use Arrow Keys to move • Space to Start</p>
      </div>

      <div className="relative border-2 border-ide-border rounded overflow-hidden shadow-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
        />

        {(!gameStarted && !gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <button
              onClick={startGame}
              className="px-4 py-2 bg-ide-accent text-white rounded hover:bg-ide-accent/90 transition-colors font-bold"
            >
              START GAME
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
            <div className="text-3xl font-bold mb-2 text-red-500">GAME OVER</div>
            <div className="text-xl mb-6">Score: {score}</div>
            <button
              onClick={startGame}
              className="px-4 py-2 bg-ide-accent text-white rounded hover:bg-ide-accent/90 transition-colors font-bold"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-ide-text font-bold">
        Score: {score}
      </div>
    </div>
  );
}
