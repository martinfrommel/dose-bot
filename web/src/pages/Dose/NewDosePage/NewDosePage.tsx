import NewDose from 'src/components/Dose/NewDose'

type NewDosePageProps = {
  slug: string
}

const NewDosePage = ({ slug }: NewDosePageProps) => {
  return <NewDose slug={slug} />
}

export default NewDosePage
