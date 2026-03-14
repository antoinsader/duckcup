import { Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import ProtectedRouteApp from "./protected_route_app";

export default function Router() {
  return (
    <Routes>
      {routes.map((ele) => (
          <Route
            key={ele.id}
            path={ele.href}
            element={
              ele.requires_auth ? (
                <ProtectedRouteApp>{ele.element}</ProtectedRouteApp>
              ) : (
                ele.element
              )
            }
          />
      ))}
    </Routes>
  );
}
