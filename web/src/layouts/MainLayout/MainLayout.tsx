import { Metadata } from '@cedarjs/web'

type MainLayoutProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

const MainLayout = ({ children, title, description }: MainLayoutProps) => {
  return (
    <>
      <Metadata title={title} description={description} />
      <main>{children}</main>
    </>
  )
}

export default MainLayout
