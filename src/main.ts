import p5 from "p5";

import './style.css'

let pause = false

interface Vector {
  x: number;
  y: number;
}

interface Worm {
  a: Vector;
  b: Vector;
  c: Vector;
  completion: number;
  position1?: Vector;
  position2?: Vector;
  color: string;
  last_move_id: number;
}

let worms : Array<Worm>

const interpolate = (v1: Vector, v2: Vector, a: number) => (
  {
    x: v1.x * (1.0 - a) + v2.x * a,
    y: v1.y * (1.0 - a) + v2.y * a
  }
)

const move_size : number = 50

const moves = [
  { x: 0, y: move_size },
  { x: 0, y: -move_size },
  { x: move_size, y: -move_size },
  { x: move_size, y: 0 },
  { x: move_size, y: move_size },
  { x: -move_size, y: -move_size },
  { x: -move_size, y: 0 },
  { x: -move_size, y: move_size },
]

let possible_moves : Array<Array<Vector>> = []

const colors = [ "#555555", "#FF8080", "#CDFADB", "#58A399", "#A8CD9F",
  "#496989", "#EFBC9B", "#D6DAC8"]
// const colors = [
//   "#D9D9D9",
//   "#595856",
//   "#8C8A88",
//   "#262523",
//   "#BFBEBD",
// ]

const randomInt = (n : number) => Math.floor(Math.random() * n)

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight)
    p.background(240)

    let start : Vector = { x: p.width * 0.1, y: p.height * 0.5 }
    worms = []

    for (let i = 0; i < colors.length; ++i) {
      worms.push({
        a: { x: start.x + 200 * i, y: start.y * i },
        b: { x: start.x + 165 * i, y: start.y + 15 * i },
        c: { x: start.x + 170 * i, y: start.y + 30 * i },
        completion: 1.0,
        color: colors[i],
        last_move_id: i % moves.length
      })
    }

    moves.forEach(move => {
      let possible_for_move : Array<Vector> = []

      moves.forEach(maybe_move => {
        if (move != maybe_move &&
            ((move.x == maybe_move.x &&
              Math.abs(move.y - maybe_move.y) < 2 * move_size) ||
                (move.y == maybe_move.y &&
                 Math.abs(move.x - maybe_move.x) < 2 * move_size))) {
          possible_for_move.push(maybe_move)
        }
      })

      possible_moves.push(possible_for_move)
    })
  }

  p.draw = () => {
    if (pause) { return }

    // p.background(240)
    p.stroke(100)
    // p.noStroke()
    p.strokeWeight(1)
    // p.rect(10, 10, 100, 100)

    worms.forEach(worm => {
      worm.position1 = interpolate(worm.a, worm.b, worm.completion)
      worm.position2 = interpolate(worm.b, worm.c, worm.completion)

      let c = p.color(worm.color)
      c.setAlpha(10)
      p.stroke(c)
      p.fill(c)
      // p.line(worm.position1.x, worm.position1.y, worm.position2.x, worm.position2.y)
      p.curve(worm.a.x, worm.a.y,
              worm.position1.x, worm.position1.y,
              worm.position2.x, worm.position2.y,
              worm.c.x, worm.c.y)

      worm.completion += p.deltaTime * 0.0002

      if (worm.completion >= 1.0) {
        worm.completion -= 1.0

        worm.a = worm.b
        worm.b = worm.c

        let random_i : number = randomInt(2)
        let random_move : Vector = possible_moves[worm.last_move_id][random_i]
        let n = 5
        if ((worm.c.y <= n * move_size && random_move.y < 0) ||
            (worm.c.y > window.innerHeight - n * move_size && random_move.y > 0) ||
              (worm.c.x <= n * move_size && random_move.x < 0) ||
                (worm.c.x > window.innerWidth - n * move_size && random_move.x > 0)) {
          random_move = possible_moves[worm.last_move_id][(random_i + 1) % 2]

          worm.last_move_id = moves.findIndex(move => move == random_move)
        }

        worm.c = { x: worm.c.x + random_move.x, y: worm.c.y + random_move.y }
      }
    })
  }
}

window.onkeyup = () => { pause = !pause }

new p5(sketch)
