import { useState } from 'react'
import './App.css'
import { Route, Routes, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Footer, GigCard, Navbar, TrustedBy } from './components/index.component'
import { Add, Gig, Home, Login, Message, Messages, MyGigs, Orders, Pay, Register, Success } from './page/index.page'

function App() {
  const Layout = () => {
    return (
      <div className="app">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    )
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <Home />
        },
        {
          path: '/gigs',
          element: <Gig />
        },
        {
          path: '/myGigs',
          element: <MyGigs />
        },
        {
          path: '/orders',
          element: <Orders />
        },
        {
          path: '/messages',
          element: <Messages />
        },
        {
          path: '/message/:id',
          element: <Message />
        },
        {
          path: '/add',
          element: <Add />
        },
        {
          path: '/gig/:id',
          element: <Gig />
        },
        {
          path: '/register',
          element: <Register />
        },
        {
          path: '/login',
          element: <Login/>
        },
        {
          path: '/pay/:id',
          element: <Pay/>
        },
        {
          path: '/success',
          element: <Success/>
        }
      ]
    }
  ])

  return <RouterProvider router={router} />
}

export default App