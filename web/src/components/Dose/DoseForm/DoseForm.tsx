import type { EditDoseById, UpdateDoseInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  RadioField,
  Submit,
} from '@cedarjs/forms'

type FormDose = NonNullable<EditDoseById['dose']>

interface DoseFormProps {
  dose?: EditDoseById['dose']
  onSave: (data: UpdateDoseInput, id?: FormDose['id']) => void
  error: RWGqlError
  loading: boolean
}

const DoseForm = (props: DoseFormProps) => {
  const onSubmit = (data: FormDose) => {
    props.onSave(data, props?.dose?.id)
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
        <TextField
          name="amount"
          defaultValue={props.dose?.amount}
          className="input input-bordered w-full"
          errorClassName="input input-bordered input-error w-full"
          validation={{ valueAsNumber: true, required: true }}
        />
        <FieldError name="amount" className="label-text-alt text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="unit" className="label" errorClassName="label">
          <span className="label-text">Unit</span>
        </Label>
        <div className="flex flex-wrap gap-4">
          {['MG', 'ML', 'G', 'IU'].map((u, i) => (
            <label key={u} className="label cursor-pointer gap-2">
              <RadioField
                id={`dose-unit-${i}`}
                name="unit"
                defaultValue={u}
                defaultChecked={props.dose?.unit?.includes(u)}
                className="radio"
                errorClassName="radio"
              />
              <span className="label-text">{u}</span>
            </label>
          ))}
        </div>
        <FieldError name="unit" className="label-text-alt text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="substanceId" className="label" errorClassName="label">
          <span className="label-text">Substance ID</span>
        </Label>
        <TextField
          name="substanceId"
          defaultValue={props.dose?.substanceId}
          className="input input-bordered w-full"
          errorClassName="input input-bordered input-error w-full"
          validation={{ required: true }}
        />
        <FieldError name="substanceId" className="label-text-alt text-error" />
      </div>

      <div className="form-control mt-6">
        <Submit disabled={props.loading} className="btn btn-primary">
          {props.loading ? 'Saving...' : 'Save'}
        </Submit>
      </div>
    </Form>
  )
}

export default DoseForm
