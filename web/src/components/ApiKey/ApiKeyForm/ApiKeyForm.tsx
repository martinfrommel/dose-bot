import type { EditApiKeyById, UpdateApiKeyInput } from 'types/graphql'

import type { RWGqlError } from '@cedarjs/forms'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  CheckboxField,
  DatetimeLocalField,
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
  const onSubmit = (data: FormApiKey) => {
    props.onSave(data, props?.apiKey?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormApiKey> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="key"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Key
        </Label>

        <TextField
          name="key"
          defaultValue={props.apiKey?.key}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="key" className="rw-field-error" />

        <Label
          name="enabled"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Enabled
        </Label>

        <CheckboxField
          name="enabled"
          defaultChecked={props.apiKey?.enabled}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="enabled" className="rw-field-error" />

        <Label
          name="validUntil"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Valid until
        </Label>

        <DatetimeLocalField
          name="validUntil"
          defaultValue={formatDatetime(props.apiKey?.validUntil)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="validUntil" className="rw-field-error" />

        <Label
          name="description"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Description
        </Label>

        <TextField
          name="description"
          defaultValue={props.apiKey?.description}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="description" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ApiKeyForm
