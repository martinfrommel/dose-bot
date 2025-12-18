import { PlusIcon } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import DosesCell from 'src/components/Dose/DosesCell'

type DosesPageProps = {
  slug: string
}

const DosesPage = ({ slug }: DosesPageProps) => {
  return (
    <>
      <Metadata title="Doses" description="Manage doses" />
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <Link to={routes.newDose({ slug })} className="btn btn-primary">
          <PlusIcon className="size-4" /> Create New Dose
        </Link>
      </div>
      <div className="rounded-lg bg-base-100 p-4 shadow-md">
        <DosesCell slug={slug} />
      </div>
    </>
  )
}

export default DosesPage
