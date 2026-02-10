import React, { useEffect, useMemo, useState } from 'react'
import {
  GRID_SIZE,
  DIRECTIONS,
  createInitialState,
  setNextDirection,
  stepGame,
} from './game.js'

const TICK_MS = 140

export default function App() {
  const [state, setState] = useState(() => createInitialState())
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || state.status !== 'playing') return
    const id = setInterval(() => {
      setState((prev) => stepGame(prev))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [paused, state.status])

  useEffect(() => {
    function handleKey(e) {
      const key = e.key.toLowerCase()
      if (key === ' ' || key === 'p') {
        e.preventDefault()
        setPaused((p) => !p)
        return
      }
      if (key === 'r') {
        e.preventDefault()
        handleRestart()
        return
      }
      const dir = keyToDirection(key)
      if (dir) {
        e.preventDefault()
        setState((prev) => setNextDirection(prev, dir))
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  function handleRestart() {
    setState(createInitialState())
    setPaused(false)
  }

  const snakeSet = useMemo(() => {
    const set = new Set()
    state.snake.forEach((part) => set.add(`${part.x},${part.y}`))
    return set
  }, [state.snake])

  const gridCells = []
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x},${y}`
      const isSnake = snakeSet.has(key)
      const isFood = state.food && state.food.x === x && state.food.y === y
      const isHead = state.snake[0].x === x && state.snake[0].y === y
      gridCells.push(
        <div
          key={key}
          className={`cell${isSnake ? ' snake' : ''}${isHead ? ' head' : ''}${
            isFood ? ' food' : ''
          }`}
        />
      )
    }
  }

  const statusLabel =
    state.status === 'dead'
      ? 'Game over'
      : state.status === 'won'
      ? 'You win'
      : paused
      ? 'Paused'
      : 'Playing'

  return (
    <div className="app">
      <header className="header">
        <div className="title">Snake</div>
        <div className="score">Score: {state.score}</div>
        <div className="status">{statusLabel}</div>
      </header>

      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {gridCells}
      </div>

      <div className="controls">
        <button
          type="button"
          className="btn"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="btn" onClick={handleRestart}>
          Restart
        </button>
      </div>

      <div className="mobile-controls" aria-label="Touch controls">
        <div className="row">
          <button
            type="button"
            className="btn"
            onClick={() => setState((prev) => setNextDirection(prev, DIRECTIONS.up))}
          >
            Up
          </button>
        </div>
        <div className="row">
          <button
            type="button"
            className="btn"
            onClick={() =>
              setState((prev) => setNextDirection(prev, DIRECTIONS.left))
            }
          >
            Left
          </button>
          <button
            type="button"
            className="btn"
            onClick={() =>
              setState((prev) => setNextDirection(prev, DIRECTIONS.down))
            }
          >
            Down
          </button>
          <button
            type="button"
            className="btn"
            onClick={() =>
              setState((prev) => setNextDirection(prev, DIRECTIONS.right))
            }
          >
            Right
          </button>
        </div>
      </div>

      <div className="help">
        Arrow keys or WASD to move. Space/P to pause. R to restart.
      </div>
    </div>
  )
}

function keyToDirection(key) {
  switch (key) {
    case 'arrowup':
    case 'w':
      return DIRECTIONS.up
    case 'arrowdown':
    case 's':
      return DIRECTIONS.down
    case 'arrowleft':
    case 'a':
      return DIRECTIONS.left
    case 'arrowright':
    case 'd':
      return DIRECTIONS.right
    default:
      return null
  }
}
