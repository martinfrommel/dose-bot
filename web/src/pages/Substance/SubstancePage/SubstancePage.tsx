import SubstanceCell from 'src/components/Substance/SubstanceCell'

type SubstancePageProps = {
  slug: string
}

const SubstancePage = ({ slug }: SubstancePageProps) => {
  return <SubstanceCell slug={slug} />
}

export default SubstancePage
