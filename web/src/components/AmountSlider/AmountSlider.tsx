import React, { useState } from 'react'

interface AmountSliderProps {
  name: string
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const AmountSlider = ({
  name,
  value = 0,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
}: AmountSliderProps) => {
  const [internalValue, setInternalValue] = useState(value)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Amount: {internalValue}</span>
        <span className="text-xs text-gray-500">Step: {step}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleSliderChange}
        className="range range-sm w-full"
      />
    </div>
  )
}

export default AmountSlider
