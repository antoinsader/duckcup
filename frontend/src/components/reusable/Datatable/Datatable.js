import {
  Fragment,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import PropTypes from "prop-types";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { getFormattedDateTimeValue } from "../../../lib/utils/datetime";

import DatatableCards from "./DatatableCards";
import ErrorComp from "../Error/Error";

import "./DataTable.scss";

const DEFAULT_ROWS_PER_PAGE = 50;
const DEFAULT_ROWS_OPTIONS = [5, 10, 20, 50, 100];
const MOBILE_VIEWPORT_WIDTH = 768;
const SORT_DIRECTION_LABELS = {
  asc: " ▲",
  desc: " ▼",
};

const getPaginationStateFromProps = (
  current_page_num,
  current_num_rows,
  rows_per_page_default,
) => {
  return {
    pageIndex: Math.max((current_page_num || 1) - 1, 0),
    pageSize:
      current_num_rows || rows_per_page_default || DEFAULT_ROWS_PER_PAGE,
  };
};

const getUniquePositiveSortedValues = (values) => {
  return [...new Set(values)]
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
};

const getTruncatedPartValue = (value) => {
  if (typeof value !== "string") return value;

  const words = value.split(" ");
  if (words.length <= 10) return value;

  return `${words.slice(0, 10).join(" ")}...`;
};

const areRowArraysEqualByReference = (left_rows, right_rows) => {
  if (!Array.isArray(left_rows) || !Array.isArray(right_rows)) return false;
  if (left_rows.length !== right_rows.length) return false;

  for (let row_index = 0; row_index < left_rows.length; row_index += 1) {
    if (left_rows[row_index] !== right_rows[row_index]) {
      return false;
    }
  }

  return true;
};

export default function DataTable({
  columns,
  data,
  loading,
  title,
  subtitle,
  row_click,
  customBtns,
  rows_per_page_default,
  hide_rows_per_page,
  className,
  server_pagination,
  total_rows,
  current_page_num,
  current_num_rows,
  on_pagination_change,
  row_class_name,
  allow_select_rows,
  selected_primary_values,
  on_selected_primary_values_change,
  on_filters_state_change,
  on_filtered_data_change,
}) {
  const table_data = useMemo(() => data || [], [data]);
  const initial_pagination = useMemo(
    () =>
      getPaginationStateFromProps(
        current_page_num,
        current_num_rows,
        rows_per_page_default,
      ),
    [current_num_rows, current_page_num, rows_per_page_default],
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState(initial_pagination);
  const last_emitted_filtered_rows_ref = useRef([]);
  const [is_mobile_viewport, set_is_mobile_viewport] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;

    return window.matchMedia(`(max-width: ${MOBILE_VIEWPORT_WIDTH}px)`).matches;
  });

  const primary_column = useMemo(
    () => columns.find((col) => col.primary === true) || null,
    [columns],
  );
  const primary_field = primary_column?.field;

  const selection_error_message = useMemo(() => {
    if (!allow_select_rows) return "";
    if (!primary_field) {
      return "Row selection requires one column marked with primary: true.";
    }
    return "";
  }, [allow_select_rows, primary_field]);

  useEffect(() => {
    if (!selection_error_message) return;
    console.error(selection_error_message);
  }, [selection_error_message]);

  const normalized_selected_primary_values = useMemo(() => {
    if (!Array.isArray(selected_primary_values)) return [];
    return selected_primary_values;
  }, [selected_primary_values]);

  const isPrimaryValueSelected = useCallback(
    (primary_value) => {
      return normalized_selected_primary_values.some(
        (value) => value === primary_value,
      );
    },
    [normalized_selected_primary_values],
  );

  const emitSelectedPrimaryValues = useCallback(
    (next_selected_values) => {
      if (typeof on_selected_primary_values_change !== "function") return;
      on_selected_primary_values_change(next_selected_values);
    },
    [on_selected_primary_values_change],
  );

  const togglePrimaryValueSelection = useCallback(
    (primary_value) => {
      if (!allow_select_rows || !primary_field) return;

      const already_selected = normalized_selected_primary_values.some(
        (value) => value === primary_value,
      );

      const next_selected_values = already_selected
        ? normalized_selected_primary_values.filter(
            (value) => value !== primary_value,
          )
        : [...normalized_selected_primary_values, primary_value];

      emitSelectedPrimaryValues(next_selected_values);
    },
    [
      allow_select_rows,
      emitSelectedPrimaryValues,
      normalized_selected_primary_values,
      primary_field,
    ],
  );

  const handleRowSelectionToggle = useCallback(
    (row_original) => {
      if (!primary_field) return;
      togglePrimaryValueSelection(row_original?.[primary_field]);
    },
    [primary_field, togglePrimaryValueSelection],
  );

  const handleSearchChange = useCallback((event) => {
    setGlobalFilter(event.target.value);
  }, []);

  const handlePaginationChange = useCallback(
    (updater) => {
      setPagination((prev_state) => {
        const next_state =
          typeof updater === "function" ? updater(prev_state) : updater;

        if (
          server_pagination &&
          typeof on_pagination_change === "function" &&
          (next_state.pageIndex !== prev_state.pageIndex ||
            next_state.pageSize !== prev_state.pageSize)
        ) {
          on_pagination_change({
            page_num: next_state.pageIndex + 1,
            num_rows: next_state.pageSize,
          });
        }

        return next_state;
      });
    },
    [on_pagination_change, server_pagination],
  );

  useEffect(() => {
    if (!server_pagination) return;

    setPagination((prev_state) => {
      const next_state = getPaginationStateFromProps(
        current_page_num,
        current_num_rows,
        rows_per_page_default,
      );

      if (
        prev_state.pageIndex === next_state.pageIndex &&
        prev_state.pageSize === next_state.pageSize
      ) {
        return prev_state;
      }

      return next_state;
    });
  }, [
    current_num_rows,
    current_page_num,
    rows_per_page_default,
    server_pagination,
  ]);

  useEffect(() => {
    if (server_pagination || !hide_rows_per_page) return;

    setPagination((prev_state) => {
      const next_page_size = Math.max(table_data.length, 1);

      if (prev_state.pageSize === next_page_size && prev_state.pageIndex === 0) {
        return prev_state;
      }

      return {
        ...prev_state,
        pageIndex: 0,
        pageSize: next_page_size,
      };
    });
  }, [hide_rows_per_page, server_pagination, table_data.length]);

  useEffect(() => {
    if (typeof on_filters_state_change !== "function") return;

    on_filters_state_change({
      global_filter: globalFilter,
      column_filters: columnFilters,
      sorting,
    });
  }, [columnFilters, globalFilter, on_filters_state_change, sorting]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const media_query = window.matchMedia(
      `(max-width: ${MOBILE_VIEWPORT_WIDTH}px)`,
    );

    const handle_viewport_change = (event) => {
      set_is_mobile_viewport(event.matches);
    };

    set_is_mobile_viewport(media_query.matches);
    media_query.addEventListener("change", handle_viewport_change);

    return () => {
      media_query.removeEventListener("change", handle_viewport_change);
    };
  }, []);

  const tableColumns = useMemo(() => {
    const visible_columns = columns
      .filter((col) => !col.hide)
      .map((col) => ({
        accessorKey: col.field,
        header: col.label,
        size: col.width,
        enableSorting: true,
        enableColumnFilter: !col.actions && col.enable_column_search !== false,
        meta: {
          is_action_column: Boolean(col.actions),
          search_visible: col.search_visible === true,
        },

        cell: ({ row, getValue }) => {
          const value = getValue();

          if (col.actions) {
            const should_show_action =
              typeof col.show_when === "function"
                ? col.show_when(row.original)
                : true;
            const resolved_action_label =
              typeof col.action_label === "function"
                ? col.action_label(row.original)
                : col.action_label;

            if (!should_show_action) return null;

            return resolved_action_label ? (
              <button
                type="button"
                className={`datatable_action_btn ${col.action_btn_class || ""}`.trim()}
                onClick={(e) => {
                  e.stopPropagation();
                  col.click?.(row.original);
                }}
              >
                {resolved_action_label}
              </button>
            ) : (
              <span
                className="action_icon_wrapper"
                title={col.label}
                onClick={(e) => {
                  e.stopPropagation();
                  col.click?.(row.original);
                }}
              >
                {col.icon}
              </span>
            );
          }

          if (col.type === "part") {
            return getTruncatedPartValue(value);
          }

          if (col.type === "datetime") {
            return getFormattedDateTimeValue(value);
          }

          if (typeof col.click === "function") {
            return (
              <span
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  col.click(row.original);
                }}
              >
                {value}
              </span>
            );
          }

          if (typeof col.format === "function") {
            return col.format(value);
          }
          return value;
        },
      }));

    if (!(allow_select_rows && primary_field)) {
      return visible_columns;
    }

    const selection_column = {
      id: "__select__",
      header: "",
      size: 52,
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        is_selection_column: true,
      },
      cell: ({ row }) => {
        const primary_value = row.original?.[primary_field];

        return (
          <input
            type="checkbox"
            className="datatable_row_checkbox"
            checked={isPrimaryValueSelected(primary_value)}
            onClick={(event) => event.stopPropagation()}
            onChange={() => togglePrimaryValueSelection(primary_value)}
          />
        );
      },
    };

    return [selection_column, ...visible_columns];
  }, [
    allow_select_rows,
    columns,
    isPrimaryValueSelected,
    primary_field,
    togglePrimaryValueSelection,
  ]);

  const page_count = useMemo(() => {
    if (!server_pagination) return undefined;

    return Math.max(
      1,
      Math.ceil((Number(total_rows) || 0) / pagination.pageSize),
    );
  }, [pagination.pageSize, server_pagination, total_rows]);

  const table = useReactTable({
    data: table_data,
    columns: tableColumns,

    state: {
      globalFilter,
      columnFilters,
      sorting,
      pagination,
    },

    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: server_pagination
      ? undefined
      : getPaginationRowModel(),
    manualPagination: Boolean(server_pagination),
    pageCount: page_count,
  });

  const rows_per_page_options = useMemo(() => {
    if (server_pagination) {
      return getUniquePositiveSortedValues([
        ...DEFAULT_ROWS_OPTIONS,
        pagination.pageSize,
      ]);
    }

    return getUniquePositiveSortedValues([
      ...DEFAULT_ROWS_OPTIONS,
      table_data.length,
    ]);
  }, [pagination.pageSize, server_pagination, table_data.length]);

  const visible_custom_buttons = useMemo(() => {
    if (!customBtns) return null;
    return customBtns.filter((btn) => !btn.hide);
  }, [customBtns]);

  const row_model_rows = table.getRowModel().rows;
  const has_rows = row_model_rows.length > 0;
  const should_show_footer =
    !hide_rows_per_page && (server_pagination || table_data.length > 0);
  const has_column_filters = table
    .getHeaderGroups()
    .some((header_group) =>
      header_group.headers.some(
        (header) =>
          header.column.getCanFilter() &&
          header.column.columnDef.meta?.search_visible === true,
      ),
    );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      table.setPageSize(Number(event.target.value));
    },
    [table],
  );

  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  const pagination_state = table.getState().pagination;

  useEffect(() => {
    if (typeof on_filtered_data_change !== "function") return;

    const filtered_rows = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (
      areRowArraysEqualByReference(
        last_emitted_filtered_rows_ref.current,
        filtered_rows,
      )
    ) {
      return;
    }

    last_emitted_filtered_rows_ref.current = filtered_rows;

    on_filtered_data_change(filtered_rows);
  }, [
    columnFilters,
    globalFilter,
    on_filtered_data_change,
    sorting,
    table,
    table_data,
  ]);

  const getRowClassName = useCallback(
    (row) => {
      const row_primary_value = primary_field
        ? row.original?.[primary_field]
        : undefined;
      const is_row_selected =
        allow_select_rows && primary_field
          ? isPrimaryValueSelected(row_primary_value)
          : false;
      const extra_row_class =
        typeof row_class_name === "function"
          ? row_class_name(row.original)
          : "";

      return `${typeof row_click === "function" ? "clickable" : ""} ${
        row.original.active ? "active" : ""
      } ${is_row_selected ? "selected" : ""} ${extra_row_class || ""}`.trim();
    },
    [
      allow_select_rows,
      isPrimaryValueSelected,
      primary_field,
      row_class_name,
      row_click,
    ],
  );

  const handleRowClick = useCallback(
    (row_original) => {
      if (allow_select_rows && !row_click) {
        handleRowSelectionToggle(row_original);
      }

      row_click?.(row_original);
    },
    [allow_select_rows, handleRowSelectionToggle, row_click],
  );

  return (
    <div className={`datatable_root ${className}`}>
      <div className="datatable_header">
        <div className="title_container">
          <h2 className="title">{title}</h2>
          <p className="subtitle">{subtitle}</p>
        
        </div>

        <div className="d-flex">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={handleSearchChange}
            className="datatable_search"
          />

          <div className="custom_btns">
            {visible_custom_buttons &&
              visible_custom_buttons.map((btn) => (
                <button
                  key={btn.key}
                  className={`${btn.class} ${loading ? "loading" : ""}`}
                  onClick={loading ? () => {} : btn.onClick}
                >
                  {btn.icon} {btn.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      <ErrorComp error={selection_error_message} />

      {is_mobile_viewport ? (
        <DatatableCards
          table={table}
          loading={loading}
          row_click={row_click}
          row_class_name={row_class_name}
          sort_direction_labels={SORT_DIRECTION_LABELS}
          allow_select_rows={allow_select_rows}
          primary_field={primary_field}
          is_primary_value_selected={isPrimaryValueSelected}
          on_row_selection_toggle={handleRowSelectionToggle}
        />
      ) : (
        <div className="datatable_wrapper">
          <table className="datatable_table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Fragment key={headerGroup.id}>
                  <tr>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ width: header.column.columnDef.size }}
                        className={header.column.getIsSorted() ? "sorted" : ""}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                        {SORT_DIRECTION_LABELS[header.column.getIsSorted()] ??
                          null}
                      </th>
                    ))}
                  </tr>

                  {has_column_filters && (
                    <tr className="column_filters_row">
                      {headerGroup.headers.map((header) => {
                        const can_filter =
                          header.column.getCanFilter() &&
                          header.column.columnDef.meta?.search_visible === true;

                        return (
                          <th
                            key={`${header.id}_filter`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {can_filter ? (
                              <input
                                type="text"
                                className="column_filter_input"
                                value={header.column.getFilterValue() ?? ""}
                                onChange={(event) => {
                                  header.column.setFilterValue(
                                    event.target.value,
                                  );
                                }}
                                onClick={(event) => event.stopPropagation()}
                                placeholder={`Search ${String(header.column.columnDef.header || "")}`}
                              />
                            ) : null}
                          </th>
                        );
                      })}
                    </tr>
                  )}
                </Fragment>
              ))}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableColumns.length} className="loading_cell">
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : has_rows ? (
                row_model_rows.map((row) => (
                  <tr
                    key={row.id}
                    className={getRowClassName(row)}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableColumns.length} className="no_data">
                    No matching data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

        {should_show_footer && (
            <div className="datatable_pagination">
              <div className="rows_info">
                <span className="pagination_label">Rows per page</span>
                <select
                  value={pagination_state.pageSize}
                  onChange={handleRowsPerPageChange}
                  className="rows_select"
                  aria-label="Rows per page"
                >
                  {rows_per_page_options.map((size) => (
                    <option key={size} value={size}>
                      {!server_pagination && size === table_data.length
                        ? "All"
                        : size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pagination_controls">
                <span className="page_count" aria-live="polite">
                  Page {pagination_state.pageIndex + 1} of {table.getPageCount()}
                </span>

                <button
                  className="page_btn"
                  disabled={!table.getCanPreviousPage()}
                  onClick={handlePreviousPage}
                  aria-label="Go to previous page"
                >
                  ← Previous
                </button>

                <button
                  className="page_btn page_btn_primary"
                  disabled={!table.getCanNextPage()}
                  onClick={handleNextPage}
                  aria-label="Go to next page"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.string,
      hide: PropTypes.bool,
      type: PropTypes.oneOf(["part", null]),
      click: PropTypes.func,
      actions: PropTypes.bool,
      icon: PropTypes.node,
      show_when: PropTypes.func,
      action_label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      action_btn_class: PropTypes.string,
      enable_column_search: PropTypes.bool,
      search_visible: PropTypes.bool,
      primary: PropTypes.bool,
    }),
  ).isRequired,

  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  row_click: PropTypes.func,

  customBtns: PropTypes.arrayOf(
    PropTypes.shape({
      hide: PropTypes.bool,
      class: PropTypes.string,
      key: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.node,
      label: PropTypes.string,
    }),
  ),

  rows_per_page_default: PropTypes.number,
  hide_rows_per_page: PropTypes.bool,
  className: PropTypes.string,
  server_pagination: PropTypes.bool,
  total_rows: PropTypes.number,
  current_page_num: PropTypes.number,
  current_num_rows: PropTypes.number,
  on_pagination_change: PropTypes.func,
  row_class_name: PropTypes.func,
  allow_select_rows: PropTypes.bool,
  selected_primary_values: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  on_selected_primary_values_change: PropTypes.func,
  on_filters_state_change: PropTypes.func,
  on_filtered_data_change: PropTypes.func,
};

DataTable.defaultProps = {
  data: [],
  loading: false,
  title: "",
  subtitle: "",
  row_click: null,
  customBtns: null,
  rows_per_page_default: 50,
  hide_rows_per_page: false,
  className: "",
  server_pagination: false,
  total_rows: 0,
  current_page_num: 1,
  current_num_rows: undefined,
  on_pagination_change: null,
  row_class_name: null,
  allow_select_rows: false,
  selected_primary_values: [],
  on_selected_primary_values_change: null,
  on_filters_state_change: null,
  on_filtered_data_change: null,
};
