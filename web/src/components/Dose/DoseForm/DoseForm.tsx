import React from 'react'

import { SaveIcon } from 'lucide-react'
import type { Dose, EditDoseById, UpdateDoseInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import { Form, FormError, FieldError, Label, Submit } from '@cedarjs/forms'

import AmountSlider from 'src/components/AmountSlider'

type FormDose = NonNullable<EditDoseById['dose']>

type DoseUnit = Dose['unit']

interface DoseFormProps {
  dose?: EditDoseById['dose']
  onSave: (data: UpdateDoseInput, id?: FormDose['id']) => void
  error: RWGqlError
  loading: boolean
  unit?: DoseUnit
}

interface MaxAmounts {
  MG: number
  ML: number
  G: number
  IU: number
}

const MAX_AMOUNTS: MaxAmounts = {
  MG: 5000,
  ML: 1000,
  G: 100,
  IU: 10000,
}

const AVAILABLE_STEPS = {
  MG: 1,
  ML: 10,
  G: 0.5,
  IU: 100,
} as const

const DoseForm = (props: DoseFormProps) => {
  const [amount, setAmount] = React.useState(props.dose?.amount || 0)
  const unit: DoseUnit = props.unit || props.dose?.unit || 'MG'

  const onSubmit = (data: FormDose) => {
    // Unit is canonical on Substance; do not submit unit edits from the UI.
    const { unit: _unit, ...rest } = data as FormDose & { unit?: DoseUnit }
    props.onSave({ ...rest, amount }, props?.dose?.id)
  }

  return (
    <Form<FormDose> onSubmit={onSubmit} error={props.error}>
      <FormError
        error={props.error}
        wrapperClassName="alert alert-error mb-4"
        titleClassName="font-bold"
        listClassName="list-disc list-inside"
      />

      <div className="form-control mb-4 w-full">
        <Label name="amount" className="label" errorClassName="label">
          <span className="label-text">Amount</span>
        </Label>
        <AmountSlider
          name="amount"
          value={amount}
          onChange={setAmount}
          min={0}
          max={MAX_AMOUNTS[unit]}
          step={AVAILABLE_STEPS[unit]}
        />
        <FieldError name="amount" className="label-text-alt text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="unit" className="label">
          <span className="label-text">Unit</span>
        </Label>
        <div className="input input-bordered flex w-full items-center">
          <span className="font-mono text-sm">{unit}</span>
        </div>
        <div className="label">
          <span className="label-text-alt">
            Unit is set on the substance and can’t be edited here.
          </span>
        </div>
      </div>

      <div className="form-control mt-6">
        <Submit disabled={props.loading} className="btn btn-primary">
          <SaveIcon className="size-4" />
          {props.loading ? 'Saving...' : 'Save'}
        </Submit>
      </div>
    </Form>
  )
}

export default DoseForm
