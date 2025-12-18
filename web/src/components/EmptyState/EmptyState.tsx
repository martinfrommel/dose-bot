import { Link } from '@cedarjs/router'

interface EmptyStateProps {
  title: string
  createLink: string
  createLabel: string
}

const EmptyState = ({ title, createLink, createLabel }: EmptyStateProps) => {
  return (
    <div className="py-8 text-center">
      <p className="mb-4">{title}</p>
      <Link to={createLink} className="btn btn-primary">
        {createLabel}
      </Link>
    </div>
  )
}

export default EmptyState
