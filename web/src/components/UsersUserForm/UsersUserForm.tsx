import {
  Form,
  Label,
  PasswordField,
  SelectField,
  Submit,
  FieldError,
  EmailField,
} from '@cedarjs/forms'

interface UsersUserFormProps {
  onSubmit: (data: {
    email: string
    plainPassword: string
    role?: string
  }) => void
  loading?: boolean
}

const UsersUserForm = ({ onSubmit, loading }: UsersUserFormProps) => {
  return (
    <Form onSubmit={onSubmit}>
      <div className="form-control mb-4 w-full">
        <Label name="email" className="label">
          <span className="label-text">Email</span>
        </Label>
        <EmailField
          name="email"
          className="input input-bordered w-full"
          errorClassName="input input-bordered input-error w-full"
          validation={{
            required: {
              value: true,
              message: 'Email is required',
            },
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format',
            },
          }}
        />
        <FieldError name="email" className="label-text-alt mt-1 text-error" />
      </div>

      <div className="form-control mb-4 w-full">
        <Label name="plainPassword" className="label">
          <span className="label-text">Password</span>
        </Label>
        <PasswordField
          name="plainPassword"
          className="input input-bordered w-full"
          errorClassName="input input-bordered input-error w-full"
          validation={{
            required: {
              value: true,
              message: 'Password is required',
            },
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          }}
        />
        <FieldError
          name="plainPassword"
          className="label-text-alt mt-1 text-error"
        />
      </div>

      <div className="form-control mb-6 w-full">
        <Label name="role" className="label">
          <span className="label-text">Role</span>
        </Label>
        <SelectField
          name="role"
          className="select select-bordered w-full"
          errorClassName="select select-bordered select-error w-full"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </SelectField>
        <FieldError name="role" className="label-text-alt mt-1 text-error" />
      </div>

      <Submit disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Creating...' : 'Create User'}
      </Submit>
    </Form>
  )
}

export default UsersUserForm
