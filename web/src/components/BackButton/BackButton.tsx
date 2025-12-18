import { back } from '@cedarjs/router'
const BackButton = () => {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm mb-4"
      onClick={() => back()}
    >
      Back
    </button>
  )
}

export default BackButton
