import p5 from "p5";

import './style.css'

let pause = false

type Vector = {
  x: number;
  y: number;
}

type Worm = {
  points: Array<Vector>,
  completion: number,
  color: string,
  segment_moves: Array<Move>,
}

type MoveType = "down" | "left" | "right" | "up"

type MoveKey = "down" | "left" | "right" | "up" | "left_and_up" | "left_and_down" | "right_and_up" | "right_and_down" | "down_and_left" | "down_and_right" | "up_and_left" | "up_and_right"

type Move = {
  type: MoveType,
  next_point: (x: number, y: number) => Vector,
  preDraw: (x1: number, y1: number, x2: number, y2: number, c: number) => void
  draw: (x1: number, y1: number, x2: number, y2: number) => void
  postDraw: (x1: number, y1: number, x2: number, y2: number, c: number) => void
}

type Moves = Record<MoveKey, Move>

type PossibleMoveKeys = Record<MoveType, Array<MoveKey>>


const randomElement = <Type>(arr : Array<Type>) : Type => (
  arr[Math.floor(Math.random() * arr.length)]
)

const sketch = (p: p5) => {
  let worms : Array<Worm>

  const move_size : number = 50
  const move_size_double : number = move_size * 2
  const margin_size : number = move_size * 3
  const points_n : number = 5

  const interpolate = (a1: number, a2: number, c: number) => (
      a1 * (1.0 - c) + a2 * c
  )

  const linePreDraw = (x1: number, y1: number, x2: number, y2: number, c: number) => {
    p.line(interpolate(x1, x2, c), interpolate(y1, y2, c), x2, y2)
  }
  const lineDraw = (x1: number, y1: number, x2: number, y2: number) => {
    p.line(x1, y1, x2, y2)
  }
  const linePostDraw = (x1: number, y1: number, x2: number, y2: number, c: number) => {
    p.line(x1, y1, interpolate(x1, x2, c), interpolate(y1, y2, c))
  }

  const moves : Moves = {
    down: {
      type: "down",
      next_point: (x: number, y: number) : Vector => (
        { x: x, y: y + move_size }
      ),
      preDraw: linePreDraw,
      draw: lineDraw,
      postDraw: linePostDraw,
    },
    down_and_left: {
      type: "left",
      next_point: (x: number, y: number) : Vector => (
        { x: x - move_size, y: y + move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 - move_size, y1, move_size_double, move_size_double, 0 + c * p.HALF_PI, p.HALF_PI)
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1 - move_size, y1, move_size_double, move_size_double, 0, p.HALF_PI)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 - move_size, y1, move_size_double, move_size_double, 0, p.HALF_PI * c)
      },
    },
    down_and_right: {
      type: "right",
      next_point: (x: number, y: number) : Vector => (
        { x: x + move_size, y: y + move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 + move_size, y1, move_size_double, move_size_double, p.HALF_PI, p.PI - p.HALF_PI * c)
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1 + move_size, y1, move_size_double, move_size_double, p.HALF_PI, p.PI)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 + move_size, y1, move_size_double, move_size_double, p.HALF_PI + (1 - c) * p.HALF_PI, p.PI)
      },
    },
    left: {
      type: "left",
      next_point: (x: number, y: number) : Vector => (
        { x: x - move_size, y: y }
      ),
      preDraw: linePreDraw,
      draw: lineDraw,
      postDraw: linePostDraw,
    },
    left_and_down: {
      type: "down",
      next_point: (x: number, y: number) : Vector => (
        { x: x - move_size, y: y + move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 + move_size, move_size_double, move_size_double, p.PI, p.PI + p.HALF_PI * (1 - c))
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1, y1 + move_size, move_size_double, move_size_double, p.PI, p.PI + p.HALF_PI)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 + move_size, move_size_double, move_size_double, p.PI + p.HALF_PI * (1 - c), p.PI + p.HALF_PI)
      },
    },
    left_and_up: {
      type: "up",
      next_point: (x: number, y: number) : Vector => (
        { x: x - move_size, y: y - move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 - move_size, move_size_double, move_size_double, p.HALF_PI + c * p.HALF_PI, p.PI)
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1, y1 - move_size, move_size_double, move_size_double, p.HALF_PI, p.PI)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 - move_size, move_size_double, move_size_double, p.HALF_PI, p.PI - (1 - c) * p.HALF_PI)
      },
    },
    up: {
      type: "up",
      next_point: (x: number, y: number) : Vector => (
        { x: x, y: y - move_size }
      ),
      preDraw: linePreDraw,
      draw: lineDraw,
      postDraw: linePostDraw,
    },
    up_and_left: {
      type: "left",
      next_point: (x: number, y: number) : Vector => (
        { x: x - move_size, y: y - move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 - move_size, y1, move_size_double, move_size_double, p.PI + p.HALF_PI, p.PI * 2 - p.HALF_PI * c)
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1 - move_size, y1, move_size_double, move_size_double, p.PI + p.HALF_PI, p.PI * 2)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 - move_size, y1, move_size_double, move_size_double, p.PI + p.HALF_PI + p.HALF_PI * (1 - c), 0)
      },
    },
    up_and_right: {
      type: "right",
      next_point: (x: number, y: number) : Vector => (
        { x: x + move_size, y: y - move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 + move_size, y1, move_size_double, move_size_double, p.PI + c * p.HALF_PI, p.PI + p.HALF_PI)
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1 + move_size, y1, move_size_double, move_size_double, p.PI, p.PI + p.HALF_PI)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1 + move_size, y1, move_size_double, move_size_double, p.PI, p.PI + p.HALF_PI * c)
      },
    },
    right: {
      type: "right",
      next_point: (x: number, y: number) : Vector => (
        { x: x + move_size, y: y }
      ),
      preDraw: linePreDraw,
      draw: lineDraw,
      postDraw: linePostDraw,
    },
    right_and_down: {
      type: "down",
      next_point: (x: number, y: number) : Vector => (
        { x: x + move_size, y: y + move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 + move_size, move_size_double, move_size_double, p.PI + p.HALF_PI + p.HALF_PI * c, 0)
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1, y1 + move_size, move_size_double, move_size_double, p.PI + p.HALF_PI, 0)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 + move_size, move_size_double, move_size_double, p.PI + p.HALF_PI, p.PI + p.HALF_PI + p.HALF_PI * c)
      },
    },
    right_and_up: {
      type: "up",
      next_point: (x: number, y: number) : Vector => (
        { x: x + move_size, y: y - move_size }
      ),
      preDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 - move_size, move_size_double, move_size_double, 0, p.HALF_PI - c * p.HALF_PI)
      },
      draw: (x1: number, y1: number, _x2: number, _y2: number) => {
        p.arc(x1, y1 - move_size, move_size_double, move_size_double, 0, p.HALF_PI)
      },
      postDraw: (x1: number, y1: number, _x2: number, _y2: number, c: number) => {
        p.arc(x1, y1 - move_size, move_size_double, move_size_double, p.HALF_PI * (1 - c), p.HALF_PI)
      },
    },
  }

  const possible_move_keys : PossibleMoveKeys = {
    down: ["down", "down_and_left", "down_and_right"],
    left: ["left", "left_and_down", "left_and_up"],
    up: ["up", "up_and_left", "up_and_right"],
    right: ["right", "right_and_down", "right_and_up"],
  }

  const move_keys = <Array<MoveKey>>Object.keys(moves)

  function picked_next_move(point : Vector, move : Move) : Move {
    let possible_next_keys : Array<MoveKey> = possible_move_keys[move.type]
    let possible_next_moves : Array<Move> = possible_next_keys.map(key => moves[key])
    let not_types = []
    if (point.y <= margin_size) {
      not_types.push("up")
    } else if (point.y > window.innerHeight - margin_size) {
      not_types.push("down")
    }
    if (point.x <= margin_size) {
      not_types.push("left")
    } else if (point.x > window.innerWidth - margin_size) {
      not_types.push("right")
    }

    if (not_types.length == 0) {
      return randomElement(possible_next_moves)
    } else {
      return randomElement(
        possible_next_moves.filter(move => !not_types.includes(move.type))
      )
    }
  }

  const colors = [
    "#555555",
    "#FF8080",
    "#CDFADB",
    "#58A399",
    "#A8CD9F",
    "#496989",
    "#EFBC9B",
    "#D6DAC8",

    "#555555",
    "#FF8080",
    "#CDFADB",
    "#58A399",
    "#A8CD9F",
    "#496989",
    "#EFBC9B",
    "#D6DAC8",
  ]

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight)
    p.background(240)

    let start : Vector = { x: p.width * 0.2, y: p.height * 0.5 }
    worms = []

    for (let i = 0; i < colors.length; ++i) {
      let start_x = start.x + p.width * 0.6 * i / colors.length + Math.random() * move_size * 0.5
      let start_y = start.y + Math.random() * (p.height * 0.3 - margin_size)
      let points : Array<Vector> = []
      points.push({ x: start_x, y: start_y })
      let segment_moves : Array<Move> = []
      segment_moves.push(moves[randomElement(move_keys)])
      points.push(segment_moves[0].next_point(points[0].x, points[0].y))
      for (let i = 1; i < points_n - 1; ++i) {
        let next_move = picked_next_move(points[i], segment_moves[i - 1])
        points.push(next_move.next_point(points[i].x, points[i].y))
        segment_moves.push(next_move)
      }
      worms.push({
        points: points,
        completion: i / colors.length,
        color: colors[i],
        segment_moves: segment_moves,
      })
    }
  }

  p.draw = () => {
    if (pause) { return }

    p.background(240)
    p.strokeWeight(10)
    p.strokeCap(p.SQUARE)
    p.noFill()

    worms.forEach(worm => {
      let c = p.color(worm.color)
      // c.setAlpha(100)
      p.stroke(c)

      for (let i = 0; i < points_n - 1; ++i) {
        let x1 = worm.points[i].x
        let y1 = worm.points[i].y
        let x2 = worm.points[i + 1].x
        let y2 = worm.points[i + 1].y

        if (x1 != x2 || y1 != y2) {
          if (i == 0) {
            worm.segment_moves[i].preDraw(x1, y1, x2, y2, worm.completion)
          } else if (i == points_n - 2) {
            worm.segment_moves[i].postDraw(x1, y1, x2, y2, worm.completion)
          } else {
            worm.segment_moves[i].draw(x1, y1, x2, y2)
          }
        }
      }

      worm.completion += p.deltaTime * 0.001

      if (worm.completion >= 1.0) {
        worm.completion -= 1.0

        for (let i : number = 0; i < points_n - 1; ++i) {
          worm.points[i] = worm.points[i + 1]
        }

        for (let i : number = 0; i < points_n - 2; ++i) {
          worm.segment_moves[i] = worm.segment_moves[i + 1]
        }

        let next_move = picked_next_move(
          worm.points[points_n - 1],
          worm.segment_moves[points_n -2]
        )
        worm.segment_moves[points_n - 2] = next_move
        worm.points[points_n - 1] =
          next_move.next_point(
            worm.points[points_n - 1].x, worm.points[points_n - 1].y
        )
      }
    })
  }
}

window.onkeyup = () => { pause = !pause }

new p5(sketch)
