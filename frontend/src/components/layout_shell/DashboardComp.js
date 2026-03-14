import { useLocation, useNavigate } from "react-router-dom";

import { LOCAL_STORAGE_KEYS } from "../../lib/config/local_storage_keys";
import { routes } from "../../lib/router/routes";
import { useCachedState } from "../../lib/contexts/CacheContext";

import Sidebar from "./SideBar";
import Navbar from "./NavBar";

import styles from "./Layout.module.scss";
import { useEffect } from "react";
import { useCommandListener } from "../../lib/contexts/CommandContext";
import { COMMAND_IDS } from "../../config/commands";

export default function DashboardComp({ children }) {
  const navigate = useNavigate();

  // Cache open tab ids, the same as route ids
  const [open_tabs_ids, set_open_tabs_ids] = useCachedState(
    LOCAL_STORAGE_KEYS.OPEN_TABS_IDS,
    [],
  );

  const [, set_visited_stack] = useCachedState(
    LOCAL_STORAGE_KEYS.TABS_ACCESS_HISTORY,
    [],
  );

  // Get active_route_id from the pathname
  const location = useLocation();
  const pathname = location.pathname;
  const activeRoute = routes.find((route) => route.href === pathname);
  const active_route_id = activeRoute.id;

  useEffect(() => {
    set_visited_stack((old) => {
      if (old[old.length - 1] === active_route_id) return old;
      return [...old, active_route_id];
    });
  }, [active_route_id, set_visited_stack]);

  const route_click = (route_id) => {
    // click from sidebar or navigation bar
    // Push route_id into open_tabs_ids and navigate to href

    const selected_route = routes.find((r) => r.id === route_id);
    set_open_tabs_ids((old) => {
      let new_ar = [...old];
      if (!old.includes(route_id)) new_ar = [...old, route_id];
      return new_ar;
    });
    if (!selected_route) {
      console.error("Route not found for id:", route_id);
      return;
    }
    navigate(selected_route.href);
  };

  const route_close = (route_id) => {
    console.log("open_tabs_ids: " , open_tabs_ids);
    const new_tabs = (open_tabs_ids || []).filter((id) => id !== route_id);
    set_open_tabs_ids(new_tabs);

    set_visited_stack((oldStack) => {
      const filteredStack = oldStack.filter((id) => id !== route_id);

      // If closing inactive tab
      if (route_id !== active_route_id) {
        return filteredStack;
      }

      // Closing active tab
      for (let i = filteredStack.length - 1; i >= 0; i--) {
        if (new_tabs.includes(filteredStack[i])) {
          const nextRoute = routes.find((r) => r.id === filteredStack[i]);
          navigate(nextRoute.href);
          return filteredStack;
        }
      }

      // No tabs left
      navigate("/noOpenTab");
      return filteredStack;
    });
  };

  const route_close_all = () => {
    console.log("Closing all tabs");
    set_open_tabs_ids([]);
    set_visited_stack([]);
    navigate("/noOpenTab");
  };

   useCommandListener(COMMAND_IDS.CLOSE_ALL_TABS, () => {
      route_close_all();
    });

  const reorderTabs = (from_index, to_index) => {
    set_open_tabs_ids((old) => {
      if (
        from_index < 0 ||
        to_index < 0 ||
        from_index >= old.length ||
        to_index >= old.length ||
        from_index === to_index
      ) {
        return old;
      }

      const new_order = [...old];
      const [moved_tab] = new_order.splice(from_index, 1);
      new_order.splice(to_index, 0, moved_tab);
      console.log("Reordered tabs:", new_order);
      return new_order;
    });
  };

  return (
    <div className={styles.workspace_root}>
      <Sidebar
        routes={routes}
        route_click={route_click}
        open_tabs_ids={open_tabs_ids}
        active_route_id={active_route_id}
      />

      <div className={styles.mainArea}>
        <Navbar
          routes={routes}
          open_tabs_ids={open_tabs_ids}
          tab_click={route_click}
          tab_close={route_close}
          tab_close_all={route_close_all}
          active_tab_id={active_route_id}
          reorderTabs={reorderTabs}
        />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
