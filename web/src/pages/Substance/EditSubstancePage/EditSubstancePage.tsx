import EditSubstanceCell from 'src/components/Substance/EditSubstanceCell'

type SubstancePageProps = {
  slug: string
}

const EditSubstancePage = ({ slug }: SubstancePageProps) => {
  return <EditSubstanceCell slug={slug} />
}

export default EditSubstancePage
