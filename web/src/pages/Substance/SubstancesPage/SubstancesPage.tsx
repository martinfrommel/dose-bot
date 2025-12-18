import { PlusIcon } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import SubstancesCell from 'src/components/Substance/SubstancesCell'

const SubstancesPage = () => {
  return (
    <>
      <Metadata title="Substances" description="Manage your substances" />
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <Link to={routes.newSubstance()} className="btn btn-primary">
          <PlusIcon className="size-4" /> Create New Substance
        </Link>
      </div>
      <div className="rounded-lg bg-base-100 p-4 shadow-md">
        <SubstancesCell />
      </div>
    </>
  )
}

export default SubstancesPage
