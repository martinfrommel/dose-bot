import { Link } from '@cedarjs/router'

interface ListActionsProps {
  viewTo?: Parameters<typeof Link>[0]['to']
  editTo?: Parameters<typeof Link>[0]['to']
  onDelete?: () => void
  viewLabel?: string
  editLabel?: string
  deleteLabel?: string
  viewTitle?: string
  editTitle?: string
  deleteTitle?: string
}

const ListActions = ({
  viewTo,
  editTo,
  onDelete,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  viewTitle,
  editTitle,
  deleteTitle,
}: ListActionsProps) => {
  return (
    <div className="flex gap-2">
      {viewTo && (
        <Link to={viewTo} className="btn btn-ghost btn-xs" title={viewTitle}>
          {viewLabel}
        </Link>
      )}
      {editTo && (
        <Link to={editTo} className="btn btn-primary btn-xs" title={editTitle}>
          {editLabel}
        </Link>
      )}
      {onDelete && (
        <button
          type="button"
          className="btn btn-error btn-xs"
          title={deleteTitle}
          onClick={onDelete}
        >
          {deleteLabel}
        </button>
      )}
    </div>
  )
}

export default ListActions
