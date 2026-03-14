import PropTypes from "prop-types";
import { flexRender } from "@tanstack/react-table";

export default function DatatableCards({
  table,
  loading,
  row_click,
  row_class_name,
  sort_direction_labels,
  allow_select_rows,
  primary_field,
  is_primary_value_selected,
  on_row_selection_toggle,
}) {
  const row_model_rows = table.getRowModel().rows;
  const has_rows = row_model_rows.length > 0;

  const sortable_columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.getCanSort?.());

  return (
    <div className="datatable_cards_root">
      {sortable_columns.length > 0 && (
        <div className="datatable_cards_sort_row">
          {sortable_columns.map((column) => {
            const sorted_direction = column.getIsSorted();
            const header_label =
              typeof column.columnDef.header === "string"
                ? column.columnDef.header
                : column.id;

            return (
              <button
                key={column.id}
                type="button"
                className={`datatable_cards_sort_btn ${
                  sorted_direction ? "sorted" : ""
                }`}
                onClick={column.getToggleSortingHandler()}
              >
                {header_label}
                {sort_direction_labels[sorted_direction] ?? ""}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="datatable_cards_loading">
          <div className="spinner"></div>
        </div>
      ) : has_rows ? (
        <div className="datatable_cards_list">
          {row_model_rows.map((row) => (
            <div
              key={row.id}
              className={`datatable_card ${
                typeof row_click === "function" ? "clickable" : ""
              } ${row.original.active ? "active" : ""} ${
                allow_select_rows && primary_field
                  ? is_primary_value_selected(row.original?.[primary_field])
                    ? "selected"
                    : ""
                  : ""
              } ${
                typeof row_class_name === "function"
                  ? row_class_name(row.original) || ""
                  : ""
              }`.trim()}
              onClick={() => {
                if (allow_select_rows && !row_click) {
                  on_row_selection_toggle?.(row.original);
                }

                row_click?.(row.original);
              }}
            >
              {allow_select_rows && primary_field && (
                <div className="datatable_card_select_row">
                  <label className="datatable_card_select_label">
                    <input
                      type="checkbox"
                      className="datatable_row_checkbox"
                      checked={is_primary_value_selected(
                        row.original?.[primary_field]
                      )}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => on_row_selection_toggle?.(row.original)}
                    />
                    Select row
                  </label>
                </div>
              )}

              {row.getVisibleCells().map((cell) => {
                const cell_label =
                  typeof cell.column.columnDef.header === "string"
                    ? cell.column.columnDef.header
                    : cell.column.id;

                const rendered_value = flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                );

                if (
                  cell.column.columnDef.meta?.is_action_column &&
                  (rendered_value === null ||
                    rendered_value === undefined ||
                    rendered_value === false)
                ) {
                  return null;
                }

                return (
                  <div key={cell.id} className="datatable_card_row">
                    <span className="datatable_card_label">{cell_label}</span>
                    <div className="datatable_card_value">{rendered_value}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="datatable_cards_no_data">No matching data found</div>
      )}
    </div>
  );
}

DatatableCards.propTypes = {
  table: PropTypes.shape({
    getRowModel: PropTypes.func.isRequired,
    getVisibleLeafColumns: PropTypes.func.isRequired,
  }).isRequired,
  loading: PropTypes.bool,
  row_click: PropTypes.func,
  row_class_name: PropTypes.func,
  sort_direction_labels: PropTypes.objectOf(PropTypes.string),
  allow_select_rows: PropTypes.bool,
  primary_field: PropTypes.string,
  is_primary_value_selected: PropTypes.func,
  on_row_selection_toggle: PropTypes.func,
};

DatatableCards.defaultProps = {
  loading: false,
  row_click: null,
  row_class_name: null,
  sort_direction_labels: {},
  allow_select_rows: false,
  primary_field: null,
  is_primary_value_selected: () => false,
  on_row_selection_toggle: null,
};
