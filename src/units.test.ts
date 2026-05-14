import { describe, it, expect } from 'vitest'
import { convert, formatWeight, toKg, toLbs } from './units'

describe('toKg', () => {
  it('returns value unchanged for kg input', () => {
    expect(toKg({ value: 100, unit: 'kg' })).toBe(100)
  })

  it('converts lbs to kg', () => {
    expect(toKg({ value: 220.462, unit: 'lbs' })).toBeCloseTo(100, 2)
  })

  it('handles zero', () => {
    expect(toKg({ value: 0, unit: 'lbs' })).toBe(0)
  })
})

describe('toLbs', () => {
  it('returns value unchanged for lbs input', () => {
    expect(toLbs({ value: 200, unit: 'lbs' })).toBe(200)
  })

  it('converts kg to lbs', () => {
    expect(toLbs({ value: 100, unit: 'kg' })).toBeCloseTo(220.462, 2)
  })

  it('handles zero', () => {
    expect(toLbs({ value: 0, unit: 'kg' })).toBe(0)
  })

  it('handles very large numbers', () => {
    expect(toLbs({ value: 1000, unit: 'kg' })).toBeCloseTo(2204.62, 1)
  })
})

describe('convert', () => {
  it('returns value unchanged when units match', () => {
    expect(convert({ value: 80, unit: 'kg' }, 'kg')).toBe(80)
    expect(convert({ value: 175, unit: 'lbs' }, 'lbs')).toBe(175)
  })

  it('converts kg to lbs', () => {
    expect(convert({ value: 100, unit: 'kg' }, 'lbs')).toBeCloseTo(220.462, 2)
  })

  it('converts lbs to kg', () => {
    expect(convert({ value: 220.462, unit: 'lbs' }, 'kg')).toBeCloseTo(100, 2)
  })
})

describe('formatWeight', () => {
  it('formats whole numbers without decimal', () => {
    expect(formatWeight({ value: 100, unit: 'kg' }, 'kg')).toBe('100 kg')
  })

  it('formats fractional values with one decimal', () => {
    expect(formatWeight({ value: 102.5, unit: 'kg' }, 'kg')).toBe('102.5 kg')
  })

  it('rounds to nearest 0.25', () => {
    expect(formatWeight({ value: 100.1, unit: 'kg' }, 'kg')).toBe('100 kg')
    expect(formatWeight({ value: 100.3, unit: 'kg' }, 'kg')).toBe('100.3 kg')
  })

  it('converts and formats cross-unit', () => {
    const result = formatWeight({ value: 100, unit: 'kg' }, 'lbs')
    expect(result).toMatch(/lbs$/)
    const num = parseFloat(result)
    expect(num).toBeCloseTo(220.5, 0)
  })

  it('handles zero', () => {
    expect(formatWeight({ value: 0, unit: 'kg' }, 'kg')).toBe('0 kg')
    expect(formatWeight({ value: 0, unit: 'kg' }, 'lbs')).toBe('0 lbs')
  })
})
