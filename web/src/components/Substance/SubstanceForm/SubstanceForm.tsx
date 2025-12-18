import type { EditSubstanceById, UpdateSubstanceInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@cedarjs/forms'

type FormSubstance = NonNullable<EditSubstanceById['substance']>

interface SubstanceFormProps {
  substance?: EditSubstanceById['substance']
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

        <FieldError
          name="description"
          className="label-text-alt text-error"
        />
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
