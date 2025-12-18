import NewDose from 'src/components/Dose/NewDose'

type NewDosePageProps = {
  slug: string
}

const NewDosePage = ({ slug }: NewDosePageProps) => {
  return <NewDose slug={slug} currentPageTitle="New Dose" />
}

export default NewDosePage
