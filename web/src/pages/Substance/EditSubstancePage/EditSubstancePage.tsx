import EditSubstanceCell from 'src/components/Substance/EditSubstanceCell'

type SubstancePageProps = {
  id: string
}

const EditSubstancePage = ({ id }: SubstancePageProps) => {
  return <EditSubstanceCell id={id} />
}

export default EditSubstancePage
