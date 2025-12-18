import EditDoseCell from 'src/components/Dose/EditDoseCell'

type DosePageProps = {
  id: string
}

const EditDosePage = ({ id }: DosePageProps) => {
  return <EditDoseCell id={id} />
}

export default EditDosePage
