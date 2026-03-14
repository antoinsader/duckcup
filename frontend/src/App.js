import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

import Router from "./lib/router/router";
import { CacheProvider } from "./lib/contexts/CacheContext";
import { AuthProvider } from "./lib/contexts/AuthContext";
import { UserProvider } from "./lib/contexts/UserContext";
import { CommandProvider } from "./lib/contexts/CommandContext";
import DashboardComp from "./components/layout_shell/DashboardComp";

import "./styles/global.scss";

function App() {
  return (
    <CacheProvider>
      <AuthProvider>
        <UserProvider>
          <CommandProvider>
            <BrowserRouter>
              <Toaster />
              <DashboardComp>
                <Router />
              </DashboardComp>
            </BrowserRouter>
          </CommandProvider>
        </UserProvider>
      </AuthProvider>
    </CacheProvider>
  );
}

export default App;
