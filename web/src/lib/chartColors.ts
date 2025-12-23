const toCssColor = (raw: string) => {
  const value = raw.trim()
  if (!value) return null

  // If the value is already a CSS color, keep it.
  if (
    value.startsWith('#') ||
    value.startsWith('rgb(') ||
    value.startsWith('rgba(') ||
    value.startsWith('hsl(') ||
    value.startsWith('hsla(') ||
    value.startsWith('oklch(')
  ) {
    return value
  }

  // daisyUI v4 theme tokens are OKLCH tuples (e.g. "65.69% 0.196 275.75").
  // daisyUI itself uses them like: oklch(var(--p) / 1)
  const parts = value.split(/\s+/)
  if (parts.length < 3) return null

  return `oklch(${value})`
}

export const getDaisyUiColor = (cssVarName: string): string | null => {
  if (typeof window === 'undefined') return null

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName)
    .trim()

  if (!raw) return null

  return toCssColor(raw)
}

export const getDefaultChartPalette = (): string[] => {
  const varNames = ['--p', '--s', '--a', '--in', '--su', '--wa', '--er', '--n']

  const colors = varNames
    .map((name) => getDaisyUiColor(name))
    .filter((v): v is string => Boolean(v))

  return colors
}
