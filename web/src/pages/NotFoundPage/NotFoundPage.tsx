import { Metadata } from '@cedarjs/web'

import MainLayout from 'src/layouts/MainLayout/MainLayout'

export default () => (
  <MainLayout>
    <Metadata
      title="404 Page Not Found"
      description="The page you are looking for does not exist."
    />
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-5xl font-bold">404</h2>
          <p className="text-lg">Page Not Found</p>
          <p className="text-base-content/70">
            Sorry, the page you are looking for does not exist.
          </p>
          <div className="card-actions mt-4">
            <a href="/" className="btn btn-primary">
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
)
