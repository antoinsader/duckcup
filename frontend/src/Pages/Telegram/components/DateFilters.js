import {  useState } from "react";
import styles from "../Telegram.module.scss";

import {
  DATE_FILTER_PRESETS,
} from "../entities_helpers.js";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";

export default function DateFilters({
  date_filter_count_map,
  selected_date_filter,
  on_select_date_filter,
  chips_disabled,
}) {

  const [card_content_open, set_card_content_open] = useState(true);



  return (
    <div className={styles.date_filters_card_root}>
      <div className={styles.card_header}  onClick={(e) => {e.preventDefault(); set_card_content_open((prev_value) => !prev_value)}}>
        <div className={styles.card_header_row}>
          <h2 className={styles.card_header_title}>
            Date filters
          </h2>



        </div>
        <div className="d-flex">
          <span className={styles.card_header_badge}>
            {selected_date_filter ? "1 active" : "None active"}
          </span>
          {
            card_content_open ?
              <FaChevronCircleDown />
              :
              <FaChevronCircleUp />
          }


        </div>

      </div>
      <div className={`${styles.analysis_date_filters_root} ${!card_content_open ? styles.hidden : ""}`}>

        <div className={styles.analysis_date_filters_chips_row}>
          {DATE_FILTER_PRESETS.map((date_filter_row) => {
            const is_active = selected_date_filter === date_filter_row.id;
            const counting = Number(
              date_filter_count_map?.[String(date_filter_row.id || "")] || "0",
            ).toString();
            return (
              <button
                type="button"
                key={date_filter_row.id}
                className={`${styles.analysis_date_chip_item} ${is_active ? styles.active : ""
                  }`}
                onClick={() => on_select_date_filter(date_filter_row.id)}
                disabled={chips_disabled}
              >
                <span>{date_filter_row.label}</span>
                <span className={styles.date_chip_count}>
                  {counting}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
