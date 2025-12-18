import SubstanceCell from 'src/components/Substance/SubstanceCell'

type SubstancePageProps = {
  id: string
}

const SubstancePage = ({ id }: SubstancePageProps) => {
  return <SubstanceCell id={id} />
}

export default SubstancePage
