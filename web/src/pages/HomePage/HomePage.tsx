// import { Link, routes } from '@cedarjs/router'

import MainLayout from 'src/layouts/MainLayout/MainLayout'

const HomePage = () => {
  return (
    <MainLayout title="Home" description="Home page">
      <h1>HomePage</h1>
      <p>
        Find me in <code>./web/src/pages/HomePage/HomePage.tsx</code>
      </p>
      {/*
          My default route is named `home`, link to me with:
          `<Link to={routes.home()}>Home</Link>`
          */}
    </MainLayout>
  )
}

export default HomePage
