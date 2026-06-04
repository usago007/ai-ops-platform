/**
 * Seeded PRNG using mulberry32 algorithm.
 * Fixed seed ensures deterministic data generation across refreshes.
 */

/** Global seed: 2025-01-15T00:00:00Z */
export const GLOBAL_SEED = 1705305600000

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SeededRng {
  /** Returns a float in [0, 1) */
  next(): number
  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number
  /** Picks a random element from the array */
  pick<T>(arr: T[]): T
  /** Returns a new shuffled copy of the array (Fisher-Yates) */
  shuffle<T>(arr: T[]): T[]
  /** Picks n distinct random elements from the array */
  pickN<T>(arr: T[], n: number): T[]
  /** Returns a float in [min, max) */
  nextFloat(min: number, max: number): number
  /** Weighted random selection: keys are items, values are weights */
  weighted<T>(weights: [T, number][]): T
}

export function createRng(seed: number): SeededRng {
  const rand = mulberry32(seed)

  const rng: SeededRng = {
    next() {
      return rand()
    },

    nextInt(min: number, max: number): number {
      return Math.floor(rng.next() * (max - min + 1)) + min
    },

    nextFloat(min: number, max: number): number {
      return rng.next() * (max - min) + min
    },

    pick<T>(arr: T[]): T {
      return arr[Math.floor(rng.next() * arr.length)]
    },

    shuffle<T>(arr: T[]): T[] {
      const result = [...arr]
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
      }
      return result
    },

    pickN<T>(arr: T[], n: number): T[] {
      if (n >= arr.length) return rng.shuffle(arr)
      const indices = new Set<number>()
      while (indices.size < n) {
        indices.add(rng.nextInt(0, arr.length - 1))
      }
      return [...indices].map(i => arr[i])
    },

    weighted<T>(weights: [T, number][]): T {
      const total = weights.reduce((sum, [, w]) => sum + w, 0)
      let r = rng.next() * total
      for (const [item, w] of weights) {
        r -= w
        if (r <= 0) return item
      }
      return weights[weights.length - 1][0]
    },
  }

  return rng
}
