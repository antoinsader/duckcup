import { useState, memo, useRef, useEffect } from "react";
import styles from "./CommandSearchBar.module.scss";
import { useCommand } from "../../../lib/contexts/CommandContext";
import {
  fuzzySearchCommands,
  initializeCommands,
} from "../../../config/commands";

/**
 * CommandSearchBar
 * Modern dropdown command search with professional UI
 */
const CommandSearchBar = memo(function CommandSearchBar({
  current_page_id,
  routes,
  openTab,
}) {
  const [search_query, set_search_query] = useState("");
  const [is_dropdown_open, set_is_dropdown_open] = useState(false);
  const [highlighted_index, set_highlighted_index] = useState(-1);
  const [, set_commands_version] = useState(0);
  const { executeCommand } = useCommand();
  const wrapper_ref = useRef(null);
  const input_ref = useRef(null);

  // Initialize commands with routes on mount
  useEffect(() => {
    if (routes && routes.length > 0) {
      initializeCommands(routes);
      set_commands_version((previous_version) => previous_version + 1);
    }
  }, [routes]);

  // Get matching commands based on search query
  const matching_commands = fuzzySearchCommands(search_query);
  const visible_commands = matching_commands.slice(0, 8);

  useEffect(() => {
    if (!is_dropdown_open || visible_commands.length === 0) {
      set_highlighted_index(-1);
      return;
    }

    set_highlighted_index((current_index) => {
      if (current_index < 0) {
        return 0;
      }
      if (current_index >= visible_commands.length) {
        return visible_commands.length - 1;
      }
      return current_index;
    });
  }, [is_dropdown_open, visible_commands.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapper_ref.current && !wrapper_ref.current.contains(event.target)) {
        set_is_dropdown_open(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        set_is_dropdown_open(true);
        input_ref.current?.focus();
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleCommandSelect = (command_id, command) => {
    const should_navigate_to_page =
      command.page_id !== undefined &&
      command.page_id !== current_page_id &&
      openTab;

    const execute_selected_command = () => {
      console.log("[command-search] executing command", {
        command_id,
        page_id: command.page_id,
      });
      executeCommand(command_id);
    };

    // If this is a navigation command, navigate to that route
    if (command.route_id !== undefined && openTab) {
      console.log("[command-search] opening route before command", {
        route_id: command.route_id,
        command_id,
      });
      openTab(command.route_id);
      setTimeout(execute_selected_command, 0);
    }
    // If command is scoped to a specific page and we're not on it, navigate there
    else if (should_navigate_to_page) {
      console.log("[command-search] opening page before command", {
        from_page_id: current_page_id,
        to_page_id: command.page_id,
        command_id,
      });
      openTab(command.page_id);
      setTimeout(execute_selected_command, 0);
    } else {
      execute_selected_command();
    }

    set_search_query("");
    set_is_dropdown_open(false);
  };

  const handleInputChange = (value) => {
    set_search_query(value);
    if (value.trim().length > 0) {
      set_is_dropdown_open(true);
    }
  };

  const handleInputFocus = () => {
    set_is_dropdown_open(true);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!is_dropdown_open) {
        set_is_dropdown_open(true);
      }
      if (visible_commands.length === 0) {
        return;
      }
      set_highlighted_index((current_index) => {
        if (current_index < 0) {
          return 0;
        }
        return (current_index + 1) % visible_commands.length;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!is_dropdown_open) {
        set_is_dropdown_open(true);
      }
      if (visible_commands.length === 0) {
        return;
      }
      set_highlighted_index((current_index) => {
        if (current_index < 0) {
          return visible_commands.length - 1;
        }
        return (current_index - 1 + visible_commands.length) % visible_commands.length;
      });
      return;
    }

    if (event.key === "Enter" && is_dropdown_open && visible_commands.length > 0) {
      event.preventDefault();
      const selected_index = highlighted_index >= 0 ? highlighted_index : 0;
      const selected_command = visible_commands[selected_index];
      handleCommandSelect(selected_command.id, selected_command);
      return;
    }

    if (event.key === "Escape" && is_dropdown_open) {
      event.preventDefault();
      set_is_dropdown_open(false);
      set_highlighted_index(-1);
    }
  };

  return (
    <div className={styles.command_search_wrapper} ref={wrapper_ref}>
      <div className={styles.search_input_container}>
        <svg
          className={styles.search_icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          ref={input_ref}
          type="text"
          placeholder="Press Ctrl + Alt + P to open command search"
          value={search_query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          className={styles.search_input}
        />
        {search_query && (
          <button
            className={styles.clear_btn}
            onClick={() => {
              set_search_query("");
              set_is_dropdown_open(false);
            }}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {is_dropdown_open && (
        <div className={styles.dropdown_menu}>
          {matching_commands.length === 0 ? (
            <div className={styles.no_results}>
              No commands found for "{search_query}"
            </div>
          ) : (
            <div className={styles.commands_list}>
              {visible_commands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  className={`${styles.command_item} ${
                    index === highlighted_index ? styles.command_item_selected : ""
                  }`}
                  onClick={() => handleCommandSelect(cmd.id, cmd)}
                  onMouseEnter={() => set_highlighted_index(index)}
                  type="button"
                >
                  <div className={styles.command_content}>
                    <div className={styles.command_name}>{cmd.name}</div>
                    <div className={styles.command_description}>
                      {cmd.description}
                    </div>
                  </div>
                  {cmd.category && (
                    <div className={styles.command_category}>
                      {cmd.category}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default CommandSearchBar;
