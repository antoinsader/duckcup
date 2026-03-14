import React, { useMemo } from "react";
import styles from "./CommandSearch.module.scss";

/**
 * CommandSearch Component
 * Displays a list of matching commands based on search query
 * Shows as a sidebar panel with command results
 */
export default function CommandSearch({ query, commands, onSelect, loading }) {
  const displayCommands = useMemo(() => {
    if (!commands || commands.length === 0) {
      return [];
    }
    return commands.slice(0, 8); // Limit to 8 results to prevent overflow
  }, [commands]);

  if (!query || query.trim().length === 0) {
    return null; // Don't show panel if no query
  }

  return (
    <div className={styles.command_search_panel}>
      {loading && <div className={styles.loading}>Loading commands...</div>}

      {!loading && displayCommands.length === 0 && (
        <div className={styles.no_results}>No commands found for "{query}"</div>
      )}

      {!loading && displayCommands.length > 0 && (
        <div className={styles.commands_list}>
          {displayCommands.map((cmd) => (
            <button
              key={cmd.id}
              className={styles.command_item}
              onClick={() => onSelect(cmd.id)}
              type="button"
            >
              <div className={styles.command_name}>{cmd.name}</div>
              <div className={styles.command_description}>{cmd.description}</div>
              {cmd.category && (
                <div className={styles.command_category}>{cmd.category}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && displayCommands.length > 0 && displayCommands.length < commands.length && (
        <div className={styles.more_results}>
          ...and {commands.length - displayCommands.length} more
        </div>
      )}
    </div>
  );
}
