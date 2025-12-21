import EditDoseCell from 'src/components/Dose/EditDoseCell'

type DosePageProps = {
  id: string
  slug: string
}

const EditDosePage = ({ id, slug }: DosePageProps) => {
  return <EditDoseCell id={id} slug={slug} />
}

export default EditDosePage
