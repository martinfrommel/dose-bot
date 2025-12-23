import type { EditSubstanceBySlug, UpdateSubstanceInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  SelectField,
  TextField,
  Submit,
} from '@cedarjs/forms'

type FormSubstance = NonNullable<EditSubstanceBySlug['substance']>

interface SubstanceFormProps {
  substance?: EditSubstanceBySlug['substance']
  onSave: (data: UpdateSubstanceInput, id?: FormSubstance['id']) => void
  error: RWGqlError
  loading: boolean
}

const SubstanceForm = (props: SubstanceFormProps) => {
  const onSubmit = (data: FormSubstance) => {
    props.onSave(data, props?.substance?.id)
  }

  return (
    <Form<FormSubstance> onSubmit={onSubmit} error={props.error}>
      <FormError
        error={props.error}
        wrapperClassName="alert alert-error mb-4"
        titleClassName="font-bold"
        listClassName="list-disc list-inside"
      />

      <div className="form-control mb-4 w-full">
        <Label name="name" className="label" errorClassName="label">
          <span className="label-text">Name</span>
        </Label>

        <TextField
          name="name"
          defaultValue={props.substance?.name}
          className="input input-bordered w-full"
          errorClassName="input input-bordered input-error w-full"
          validation={{ required: true }}
        />

        <FieldError name="name" className="label-text-alt text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="description" className="label" errorClassName="label">
          <span className="label-text">Description</span>
        </Label>

        <TextField
          name="description"
          defaultValue={props.substance?.description}
          className="input input-bordered w-full"
          errorClassName="input input-bordered input-error w-full"
        />

        <FieldError name="description" className="label-text-alt text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="unit" className="label" errorClassName="label">
          <span className="label-text">Unit</span>
        </Label>

        <SelectField
          name="unit"
          defaultValue={props.substance?.unit || undefined}
          className="select select-bordered w-full"
          errorClassName="select select-bordered select-error w-full"
          validation={{ required: true }}
        >
          <option value="MG">MG</option>
          <option value="ML">ML</option>
          <option value="G">G</option>
          <option value="IU">IU</option>
        </SelectField>

        {props.substance && (
          <div className="label">
            <span className="label-text-alt">
              Changing the unit won’t rewrite existing doses.
            </span>
          </div>
        )}

        <FieldError name="unit" className="label-text-alt text-error" />
      </div>

      <div className="form-control mt-6">
        <Submit disabled={props.loading} className="btn btn-primary">
          {props.loading ? 'Saving...' : 'Save'}
        </Submit>
      </div>
    </Form>
  )
}

export default SubstanceForm
