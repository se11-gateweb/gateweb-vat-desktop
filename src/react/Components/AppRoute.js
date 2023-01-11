import React from 'react'
import {createHashRouter, RouterProvider} from 'react-router-dom'

import Login from '../views/LoginPage'
import NotFoundPage from "../views/NotFoundPage";
import HomePage from "../views/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import IdentifiedEvidenceDetailPage from "../views/IdentifiedEvidenceDetailPage";

const routes = [
  {
    path: '/',
    element:
      <ProtectedRoute>
        <HomePage/>
      </ProtectedRoute>

  },
  {
    path: '/*',
    element: <NotFoundPage/>
  },
  {
    path: '/evidence-detail',
    element: (
      <ProtectedRoute>
        <IdentifiedEvidenceDetailPage/>
      </ProtectedRoute>
    )
  },
  {
    path: '/login',
    element: <Login/>
  }
]
const AppRoutes = () => {
  let router = createHashRouter(routes)
  return <RouterProvider router={router}/>
}

export default AppRoutes
