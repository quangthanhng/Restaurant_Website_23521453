import { useRoutes } from "react-router-dom"
import path from "./constants/path"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Homepage from "./pages/homepage"
import Admin from "./pages/admin"


export default function useRouteElement() {
  const routeElements = useRoutes([{
    path: path.home,
    element: <Homepage />
  },
  {
    path: path.login,
    element: <Login />
  },
  {
    path: path.register,
    element: <Register />
  }, {
    path: path.admin,
    element: <Admin />
  }


  ])
  return routeElements
}
