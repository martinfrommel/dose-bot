import DoseCell from 'src/components/Dose/DoseCell'

type DosePageProps = {
  id: string
}

const DosePage = ({ id }: DosePageProps) => {
  return <DoseCell id={id} />
}

export default DosePage
