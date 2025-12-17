type MainLayoutProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return <>{children}</>
}

export default MainLayout
