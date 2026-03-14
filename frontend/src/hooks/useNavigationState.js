import { act, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOCAL_STORAGE_KEYS } from "../lib/config/local_storage_keys";
import { useCachedState } from "../lib/contexts/CacheContext";

/**
 * Custom hook to manage application navigation state
 * Handles opening/closing tabs and maintains navigation history
 */
export function useNavigationState(routes) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open_tabs_ids, set_open_tabs_ids] = useCachedState(
    LOCAL_STORAGE_KEYS.OPEN_TABS_IDS,
    [],
  );

  // Persistent state: the order tabs were accessed (most recent at end)
  const [accessHistory, setAccessHistory] = useCachedState(
    LOCAL_STORAGE_KEYS.TABS_ACCESS_HISTORY,
    [],
  );

  const activeRoute = useMemo(() => {
    const found = routes.find((route) => route.href === location.pathname);
    return found || routes.find((route) => route.id === 404);
  }, [location.pathname, routes]);

  const active_route_id = activeRoute?.id;
  useEffect(() => {
    if (!active_route_id) return;

      // ensure the active route is present and at the end of the list
      set_open_tabs_ids((prev) => {
        if (prev.includes(active_route_id)) {
        return prev;
        }
        return [...prev, active_route_id];
      });

    setAccessHistory((prev) => {
      const filtered = prev.filter((id) => id !== active_route_id);
      return [...filtered, active_route_id];
    });
  }, [active_route_id, setAccessHistory, set_open_tabs_ids]);

  // Open a tab and navigate to it
  const openTab = useCallback(
    (routeId) => {
      const selectedRoute = routes.find((r) => r.id === routeId);
      if (!selectedRoute) {
        return;
      }

      // only navigate if href is a string
      if (selectedRoute.href) {
        navigate(selectedRoute.href);
      } else {
        console.warn("route has no href", selectedRoute);
      }
    },
    [routes, navigate],
  );

  const closeTab = useCallback(
    (routeId) => {
      // remove the tab from both the open list and the access history
      // using functional updates to avoid any stale closure issues.
      set_open_tabs_ids((prev) => prev.filter((id) => id !== routeId));
      setAccessHistory((prev) => prev.filter((id) => id !== routeId));

      console.log("[useNavigationState] closing tab", routeId);

      // if the user is closing the currently active tab, attempt to
      // fall back to the most recently accessed remaining tab. if none
      // are left we'll show the "no open tab" page. closing a non-
      // active tab should not change the current location at all.
      if (routeId === active_route_id) {
        // note: accessHistory already had the id stripped above, so the
        // loop won't pick it again; still safe to iterate the previous
        // value since we don't depend on the updated state here.
        for (let i = accessHistory.length - 1; i >= 0; i--) {
          const historyTabId = accessHistory[i];

          // tab must still be open
          if (open_tabs_ids.includes(historyTabId) && historyTabId !== routeId) {
            const nextRoute = routes.find((r) => r.id === historyTabId);
            if (nextRoute && nextRoute.href) {
              navigate(nextRoute.href);
              return;
            }
          }
        }

        // no remaining tabs to activate
        navigate("/noOpenTab");
      }
    },
    [
      navigate,
      open_tabs_ids,
      accessHistory,
      routes,
      active_route_id,
      set_open_tabs_ids,
      setAccessHistory,
    ],
  );

  /**
   * Reorder tabs by moving the tab at fromIndex to toIndex.  This mutates the
   * open_tabs_ids array in state, which is already persisted via
   * useCachedState (localStorage). The logic is tolerant of out-of-bounds
   * values and is a no-op when fromIndex === toIndex.
   */
  const reorderTabs = useCallback(
    (fromIndex, toIndex) => {
      console.log("[useNavigationState] reorderTabs", fromIndex, toIndex);
      set_open_tabs_ids((prev) => {
        // defensive copy
        const arr = [...prev];
        if (
          fromIndex < 0 ||
          fromIndex >= arr.length ||
          toIndex < 0 ||
          toIndex >= arr.length ||
          fromIndex === toIndex
        ) {
          return prev;
        }
        const [moved] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, moved);
        console.log("[useNavigationState] new tab order", arr);
        return arr;
      });
    },
    [set_open_tabs_ids]
  );

  return {
    open_tabs_ids,
    active_route_id,
    openTab,
    closeTab,
    reorderTabs,
  };
}
