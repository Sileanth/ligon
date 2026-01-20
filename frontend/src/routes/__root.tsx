import { Outlet, createRootRoute } from '@tanstack/react-router'

import { Navbar } from '../components/Nav'
import Footer from '../components/Footer'

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />

    </div>
  ),
})
