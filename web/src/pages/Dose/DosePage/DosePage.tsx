import DoseCell from 'src/components/Dose/DoseCell'

type DosePageProps = {
  id: string
  slug: string
}

const DosePage = ({ id, slug }: DosePageProps) => {
  return <DoseCell id={id} slug={slug} />
}

export default DosePage
