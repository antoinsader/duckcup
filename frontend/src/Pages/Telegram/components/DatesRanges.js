import { useCallback, useMemo, useState } from "react";
import styles from "../Telegram.module.scss";

import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";

export default function DatesRanges({
    start_date_range_filter_value,
    end_date_range_filter_value,
    on_start_date_range_filter_change,
    on_end_date_range_filter_change,


}) {

    const [card_content_open, set_card_content_open] = useState(true);

    const is_specific_date_range_active = (start_date_range_filter_value && start_date_range_filter_value != '') || (end_date_range_filter_value && end_date_range_filter_value != '');


    return (
        <div className={styles.date_filters_card_root}>
            <div className={styles.card_header} onClick={(e) => { e.preventDefault(); set_card_content_open((prev_value) => !prev_value) }}>
                <div className={`${styles.card_header_row} ${styles.col}`}>
                    <h2 className={styles.card_header_title}>
                        Specific Dates Range filter:
                    </h2>
                    <p className={styles.card_header_subtitle}> Whenever you choose a date here, if there is an active preset date filter, it will be deactivated  </p>
                </div>
                <div className="d-flex">
                    <span className={styles.card_header_badge}>
                            {is_specific_date_range_active
                  ? `Start: ${start_date_range_filter_value || "Any"} • End: ${end_date_range_filter_value || "Any"}`
                  : "No specific range selected"}
                    </span>
                    {
                        card_content_open ?
                            <FaChevronCircleDown />
                            :
                            <FaChevronCircleUp />
                    }


                </div>

            </div>
            <div className={`${styles.date_range_inputs_row} ${!card_content_open ? styles.hidden : ""}`}>

              <label className={styles.date_range_input_label}>
                Start date
                <input
                  type="date"
                  value={start_date_range_filter_value}
                  onChange={on_start_date_range_filter_change}
                  className={styles.date_range_input}
                />
              </label>
              <label className={styles.date_range_input_label}>
                End date
                <input
                  type="date"
                  value={end_date_range_filter_value}
                  onChange={on_end_date_range_filter_change}
                  className={styles.date_range_input}
                />
              </label>

            </div>
        </div>
    );
}
