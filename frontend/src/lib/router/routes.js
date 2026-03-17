import { CiLogin } from "react-icons/ci";
import { FiDatabase, FiHome, FiUser, FiUsers } from "react-icons/fi";
import { MdOutlineMail } from "react-icons/md";
import { FaTelegram } from "react-icons/fa";
import Home from "../../Pages/Home/Home";
import Login from "../../Pages/Login/Login";
import NotFound from "../../Pages/NotFound/NotFound";
import EmailsPage from "../../Pages/Emails/Emails";
import NoTabOpen from "../../components/layout_shell/NoTabOpen";
import Accounts from "../../Pages/Accounts/Accounts";
import Datasets from "../../Pages/Datasets/Datasets";

import Profile from "../../Pages/Profile/Profile";
import TelegramPage from "../../Pages/Telegram/Telegram";
import TestPage from "../../Pages/Test/Test";

export const routes = [
  {
    id: 1,
    href: "/",
    label: "Home",
    icon: <FiHome />,
    element: <Home />,
    dashboard: true,
  },
  {
    id: 2,
    href: "/login",
    label: "Login",
    element: <Login />,
    icon: <CiLogin />,
    is_footer_route: true,

  },
  {
    id: 3,
    href: "/emails",
    label: "Emails",
    element: <EmailsPage />,
    icon: <MdOutlineMail />,
    requires_auth: true,
    protected_app: true,
    protected_google: true,
  },
  {
    id: 5,
    href: "/accounts",
    label: "Accounts",
    element: <Accounts />,
    icon: <FiUsers />,
    requires_auth: true,
    has_extra_sidebar: true,
  },
  {
    id: 6,
    href: "/datasets",
    label: "Datasets",
    element: <Datasets />,
    icon: <FiDatabase />,
    requires_auth: true,
  },
  {
    id: 7,
    href: "/telegram",
    label: "Telegram messages",
    element: <TelegramPage />,
    icon: <FaTelegram />,
    requires_auth: true,
  },
  
  {
  id: 300,
    href: "/profile",
    label: "Profile",
    element: <Profile />,
    icon: <FiUser />,
    requires_auth: true,
    is_footer_route: true,
    show_only_if_auth: true,
  },
  { id: 499, href: "/test", element: <TestPage />, hide_sidebar: true },
  { id: 500, href: "/noOpenTab", element: <NoTabOpen />, hide_sidebar: true },
  { id: 404, href: "*", element: <NotFound />, hide_sidebar: true },

  // { id: "/profile", icon: <FaRegUser />, label: "Profile" },
  // { id: "/", icon: <FaRegFileAlt />, label: "Emails" },
  // { id: "/settings", icon: <FaCog />, label: "Settings" },
];
