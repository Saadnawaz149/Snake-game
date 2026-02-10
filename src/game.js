export const GRID_SIZE = 20

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export function createInitialState(rng = Math.random) {
  const mid = Math.floor(GRID_SIZE / 2)
  const snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ]
  const food = placeFood(snake, rng)
  return {
    snake,
    direction: DIRECTIONS.right,
    pendingDirection: DIRECTIONS.right,
    food,
    score: 0,
    status: 'playing',
  }
}

export function setNextDirection(state, nextDir) {
  if (!nextDir) return state
  if (isOpposite(state.direction, nextDir)) return state
  return { ...state, pendingDirection: nextDir }
}

export function stepGame(state, rng = Math.random) {
  if (state.status !== 'playing') return state

  const direction = state.pendingDirection
  const head = state.snake[0]
  const nextHead = { x: head.x + direction.x, y: head.y + direction.y }

  if (isOutOfBounds(nextHead)) {
    return { ...state, status: 'dead' }
  }

  const willGrow = nextHead.x === state.food.x && nextHead.y === state.food.y
  const bodyToCheck = willGrow ? state.snake : state.snake.slice(0, -1)
  if (bodyToCheck.some((part) => part.x === nextHead.x && part.y === nextHead.y)) {
    return { ...state, status: 'dead' }
  }

  const nextSnake = [nextHead, ...state.snake]
  if (!willGrow) {
    nextSnake.pop()
  }

  let nextFood = state.food
  let nextScore = state.score
  let nextStatus = state.status

  if (willGrow) {
    nextScore += 1
    const placed = placeFood(nextSnake, rng)
    if (placed) {
      nextFood = placed
    } else {
      nextStatus = 'won'
    }
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: nextScore,
    status: nextStatus,
  }
}

export function placeFood(snake, rng = Math.random) {
  const open = []
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const occupied = snake.some((part) => part.x === x && part.y === y)
      if (!occupied) open.push({ x, y })
    }
  }
  if (open.length === 0) return null
  const idx = Math.floor(rng() * open.length)
  return open[idx]
}

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0
}

function isOutOfBounds(pos) {
  return pos.x < 0 || pos.y < 0 || pos.x >= GRID_SIZE || pos.y >= GRID_SIZE
}
