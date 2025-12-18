import DosesCell from 'src/components/Dose/DosesCell'

type DosesPageProps = {
  slug: string
}

const DosesPage = ({ slug }: DosesPageProps) => {
  return <DosesCell slug={slug} />
}

export default DosesPage
