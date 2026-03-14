import NeedToLoginPage from "../../components/layout_shell/NeedToLoginPage";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRouteApp({ children }) {
  const { loading_auth, authenticated } = useAuth();

  if (loading_auth) {
    // we rely on the parent DashboardComp (mounted by Router) to provide the
    // layout; just return a simple message while auth is being determined.
    return (
      <h3>
        <span className="spinner"></span> Authenticating, please wait...
      </h3>
    );
  }

  if (!authenticated) {
    // not logged in? show the login prompt component; the outer dashboard
    // wrapper will still be rendered by Router, so the sidebar/navbar remain
    // visible.
    return <NeedToLoginPage />;
  }

  // already authenticated, render the requested page
  return children;
}
