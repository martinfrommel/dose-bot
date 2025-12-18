import { useState } from 'react'

import type { EditApiKeyById, UpdateApiKeyInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  DatetimeLocalField,
  TextAreaField,
  CheckboxField,
  Submit,
} from '@cedarjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

type FormApiKey = NonNullable<EditApiKeyById['apiKey']>

interface ApiKeyFormProps {
  apiKey?: EditApiKeyById['apiKey']
  onSave: (data: UpdateApiKeyInput, id?: FormApiKey['id']) => void
  error: RWGqlError
  loading: boolean
}

const ApiKeyForm = (props: ApiKeyFormProps) => {
  const [validForever, setValidForever] = useState(!props.apiKey?.validUntil)

  const onSubmit = (data: FormApiKey) => {
    // If valid forever is checked, set validUntil to null
    const submitData = {
      ...data,
      validUntil: validForever ? null : data.validUntil,
    }
    props.onSave(submitData, props?.apiKey?.id)
  }

  return (
    <Form<FormApiKey> onSubmit={onSubmit} error={props.error}>
      <FormError
        error={props.error}
        wrapperClassName="alert alert-error mb-4"
        titleClassName="font-bold"
        listClassName="list-disc list-inside"
      />

      <div className="form-control mb-4 w-full">
        <label className="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            className="checkbox"
            checked={validForever}
            onChange={(e) => setValidForever(e.target.checked)}
          />
          <span className="label-text">Valid Forever</span>
        </label>
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="validUntil" className="label" errorClassName="label">
          <span className="label-text">Valid Until</span>
        </Label>

        <DatetimeLocalField
          name="validUntil"
          defaultValue={formatDatetime(props.apiKey?.validUntil)}
          className="input input-bordered w-full"
          errorClassName="input input-bordered input-error w-full"
          disabled={validForever}
        />

        <FieldError name="validUntil" className="label-text-alt text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="description" className="label" errorClassName="label">
          <span className="label-text">Description</span>
        </Label>

        <TextAreaField
          name="description"
          defaultValue={props.apiKey?.description}
          className="textarea textarea-bordered w-full"
          errorClassName="textarea textarea-bordered textarea-error w-full"
        />

        <FieldError name="description" className="label-text-alt text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label
          name="enabled"
          className="label cursor-pointer justify-start gap-2"
        >
          <CheckboxField
            name="enabled"
            className="checkbox"
            defaultChecked={props.apiKey?.enabled ?? true}
          />
          <span className="label-text">Enabled</span>
        </Label>
      </div>

      <div className="form-control mt-6">
        <Submit disabled={props.loading} className="btn btn-primary">
          {props.loading ? 'Saving...' : 'Save'}
        </Submit>
      </div>
    </Form>
  )
}

export default ApiKeyForm
