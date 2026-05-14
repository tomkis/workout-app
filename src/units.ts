export type Unit = 'kg' | 'lbs'

const LBS_PER_KG = 2.20462262185

export interface WeightValue {
  value: number
  unit: Unit
}

export function toKg(w: WeightValue): number {
  if (w.unit === 'kg') return w.value
  return w.value / LBS_PER_KG
}

export function toLbs(w: WeightValue): number {
  if (w.unit === 'lbs') return w.value
  return w.value * LBS_PER_KG
}

export function convert(w: WeightValue, targetUnit: Unit): number {
  if (w.unit === targetUnit) return w.value
  return targetUnit === 'kg' ? toKg(w) : toLbs(w)
}

export function formatWeight(w: WeightValue, displayUnit: Unit): string {
  const converted = convert(w, displayUnit)
  const rounded = Math.round(converted * 4) / 4
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} ${displayUnit}`
}
