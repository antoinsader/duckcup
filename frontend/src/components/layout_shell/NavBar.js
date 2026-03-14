import { useEffect, useRef, useState } from "react";
import CommandSearchBar from "../reusable/CommandSearch/CommandSearchBar";
import styles from "./Layout.module.scss";
import AuthStatus from "./AuthStatus";
import ServerStatus from "./ServerStatus";
import { useCachedState } from "../../lib/contexts/CacheContext";
import { LOCAL_STORAGE_KEYS } from "../../lib/config/local_storage_keys";
import { FaMoon, FaSun } from "react-icons/fa";

export default function Navbar({
  routes,
  open_tabs_ids,
  tab_click,
  tab_close,
  tab_close_all,
  active_tab_id,
  reorderTabs,
}) {
  const [theme_mode, setThemeMode] = useCachedState(
    LOCAL_STORAGE_KEYS.THEME_MODE_STORAGE_KEY,
    "dark",
  );
  const [context_menu_state, set_context_menu_state] = useState({
    is_visible: false,
    x: 0,
    y: 0,
    tab_id: null,
    tab_index: -1,
  });
  const context_menu_ref = useRef(null);

  useEffect(() => {
    const saved_theme_mode = theme_mode;
    const next_theme_mode =
      saved_theme_mode === "light" || saved_theme_mode === "dark"
        ? saved_theme_mode
        : "dark";

    setThemeMode(next_theme_mode);

    if (next_theme_mode === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      return;
    }

    document.documentElement.removeAttribute("data-theme");
  }, [theme_mode, setThemeMode]);

  const toggleThemeMode = () => {
    const next_theme_mode = theme_mode === "light" ? "dark" : "light";

    setThemeMode(next_theme_mode);

    if (next_theme_mode === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      return;
    }

    document.documentElement.removeAttribute("data-theme");
  };

  const visible_tab_ids = (open_tabs_ids || []).filter((id) => {
    const route = routes.find((r) => r.id === id);
    return route && !route.hide_sidebar;
  });

  const closeContextMenu = () => {
    set_context_menu_state((old_state) => {
      if (!old_state.is_visible) return old_state;
      return {
        ...old_state,
        is_visible: false,
      };
    });
  };

  const openContextMenu = (event, tab_id, tab_index) => {
    event.preventDefault();
    event.stopPropagation();

    set_context_menu_state({
      is_visible: true,
      x: event.clientX,
      y: event.clientY,
      tab_id,
      tab_index,
    });
  };

  const moveTab = (from_visible_index, to_visible_index) => {
    if (!reorderTabs) return;

    const from_id = visible_tab_ids[from_visible_index];
    const to_id = visible_tab_ids[to_visible_index];

    const real_from = open_tabs_ids.indexOf(from_id);
    const real_to = open_tabs_ids.indexOf(to_id);

    if (real_from !== -1 && real_to !== -1) {
      reorderTabs(real_from, real_to);
    }
  };

  const closeAllTabs = () => {
    if (tab_close_all) {
      tab_close_all();
      closeContextMenu();
      return;
    }

    (open_tabs_ids || []).forEach((tab_id) => {
      tab_close(tab_id);
    });
    closeContextMenu();
  };

  const closeOtherTabs = () => {
    (open_tabs_ids || []).forEach((tab_id) => {
      if (tab_id !== context_menu_state.tab_id) {
        tab_close(tab_id);
      }
    });
    closeContextMenu();
  };

  const moveActiveContextTabLeft = () => {
    if (context_menu_state.tab_index <= 0) {
      closeContextMenu();
      return;
    }

    moveTab(context_menu_state.tab_index, context_menu_state.tab_index - 1);
    closeContextMenu();
  };

  const moveActiveContextTabRight = () => {
    if (
      context_menu_state.tab_index < 0 ||
      context_menu_state.tab_index >= visible_tab_ids.length - 1
    ) {
      closeContextMenu();
      return;
    }

    moveTab(context_menu_state.tab_index, context_menu_state.tab_index + 1);
    closeContextMenu();
  };

  useEffect(() => {
    if (!context_menu_state.is_visible) return;

    const handleOutsideClick = (event) => {
      if (!context_menu_ref.current) {
        closeContextMenu();
        return;
      }

      if (!context_menu_ref.current.contains(event.target)) {
        closeContextMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    const handleScrollOrResize = () => {
      closeContextMenu();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [context_menu_state.is_visible]);

  useEffect(() => {
    if (!context_menu_state.is_visible || !context_menu_ref.current) return;

    const frame_id = window.requestAnimationFrame(() => {
      if (!context_menu_ref.current) return;

      const rect = context_menu_ref.current.getBoundingClientRect();
      const margin = 8;
      const max_x = Math.max(margin, window.innerWidth - rect.width - margin);
      const max_y = Math.max(margin, window.innerHeight - rect.height - margin);
      const clamped_x = Math.min(Math.max(context_menu_state.x, margin), max_x);
      const clamped_y = Math.min(Math.max(context_menu_state.y, margin), max_y);

      if (
        clamped_x !== context_menu_state.x ||
        clamped_y !== context_menu_state.y
      ) {
        set_context_menu_state((old_state) => ({
          ...old_state,
          x: clamped_x,
          y: clamped_y,
        }));
      }
    });

    return () => {
      window.cancelAnimationFrame(frame_id);
    };
  }, [
    context_menu_state.is_visible,
    context_menu_state.x,
    context_menu_state.y,
  ]);

  return (
    <div className={styles.navBar}>
      <div className={styles.topNav}>
        <div className={styles.statuses_group}>
          <ServerStatus />
          <AuthStatus />
        </div>
        <div className={styles.searchBar}>
          <CommandSearchBar
            current_page_id={active_tab_id}
            routes={routes}
            openTab={tab_click}
          />
        </div>
        <div className={styles.theme_toggle_wrap}>
          <button
            className={styles.theme_toggle_button}
            type="button"
            onClick={toggleThemeMode}
            title={
              theme_mode === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
            aria-label={
              theme_mode === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
          >
            {theme_mode === "light" ? (
              <FaMoon size={14} />
            ) : (
              <FaSun size={14} />
            )}
          </button>
        </div>
      </div>
      <div
        className={styles.tabsBarContainer}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
          const last_visible_index = visible_tab_ids.length - 1;
          if (!isNaN(from) && last_visible_index >= 0) {
            moveTab(from, last_visible_index);
          }
        }}
      >
        {visible_tab_ids
          .map((id) => routes.find((t) => t.id === id))
          .filter(Boolean)
          .map((tab, index) => (
            <div
              key={tab.id}
              className={`${styles.tab_item} ${
                tab.id === active_tab_id ? styles.active : ""
              }`}
              onClick={() => tab_click(tab.id)}
              onContextMenu={(event) => openContextMenu(event, tab.id, index)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", index.toString());
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                if (!isNaN(from)) {
                  moveTab(from, index);
                }
              }}
            >
              <span className={styles.tab_label}>{tab.label}</span>
              <span
                className={styles.closeTab}
                onClick={(e) => {
                  e.stopPropagation();
                  tab_close(tab.id);
                }}
              >
                ×
              </span>
            </div>
          ))}
        {/* <div
          className={`${styles.tab}`}
        >
          New tab
        </div>
         */}
      </div>
      {context_menu_state.is_visible && (
        <div
          ref={context_menu_ref}
          className={styles.tab_context_menu}
          style={{
            left: `${context_menu_state.x}px`,
            top: `${context_menu_state.y}px`,
          }}
        >
          <button
            type="button"
            className={styles.tab_context_menu_item}
            onClick={closeOtherTabs}
          >
            Close other tabs
          </button>
          <button
            type="button"
            className={styles.tab_context_menu_item}
            onClick={closeAllTabs}
          >
            Close all tabs
          </button>
          <button
            type="button"
            className={styles.tab_context_menu_item}
            disabled={context_menu_state.tab_index <= 0}
            onClick={moveActiveContextTabLeft}
          >
            Move to the left
          </button>
          <button
            type="button"
            className={styles.tab_context_menu_item}
            disabled={
              context_menu_state.tab_index < 0 ||
              context_menu_state.tab_index >= visible_tab_ids.length - 1
            }
            onClick={moveActiveContextTabRight}
          >
            Move to the right
          </button>
        </div>
      )}
    </div>
  );
}
