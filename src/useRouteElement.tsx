import { useRoutes } from "react-router-dom"
import path from "./constants/path"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Homepage from "./pages/homepage"
import Admin from "./pages/admin"
import MainLayout from "./layouts/MainLayout"
import RegisterLayout from "./layouts/RegisterLayout"
import Menu from "./pages/Menu"
import About from "./pages/About"
import Blog from "./pages/Blog"
import Booking from "./pages/Booking"


export default function useRouteElement() {
  const routeElements = useRoutes([{
    path: path.home,
    element: (
      <MainLayout>
        <Homepage />
      </MainLayout>)

  },
  {
    path: path.login,
    element: (
      <RegisterLayout>
        <Login />
      </RegisterLayout>
    )
  },
  {
    path: path.register,
    element: (
      <RegisterLayout>
        <Register />
      </RegisterLayout>
    )
  }, {
    path: path.admin,
    element: <Admin />
  }, {
    path: path.menu,
    element: (
      <MainLayout>
        <Menu />
      </MainLayout>)
  }, {
    path: path.about,
    element: (
      <MainLayout>
        <About />
      </MainLayout>)
  }, {
    path: path.blog,
    element: (
      <MainLayout>
        <Blog />
      </MainLayout>)
  },
  {
    path: path.booking,
    element: (
      <MainLayout>
        <Booking />
      </MainLayout>)
  }


  ])
  return routeElements
}
