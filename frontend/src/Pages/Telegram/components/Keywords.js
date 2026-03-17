import { useState } from "react";
import styles from "../Telegram.module.scss";

import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";

export default function Keywords({
    account_keywords_array,
    account_keywords_counts_mapping,
    keywords_loading,
    selected_keyword_filters,
    on_select_keyword_filter,
    chips_disabled,
    keywords_error
}) {

    const [card_content_open, set_card_content_open] = useState(true);




    return (
        <div className={styles.date_filters_card_root}>
            <div className={styles.card_header} onClick={(e) => { e.preventDefault(); set_card_content_open((prev_value) => !prev_value) }}>
                <div className={styles.card_header_row}>
                    <h2 className={styles.card_header_title}>
                        Keywords filters
                    </h2>
                </div>
                <div className="d-flex">
                    <span className={styles.card_header_badge}>
                        {selected_keyword_filters?.length ? `${selected_keyword_filters.length} active` : "None active"}
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
                    {keywords_error && (
                        <div className="error_note"> {keywords_error}</div>

                    )}

                <div className={styles.analysis_date_filters_chips_row}>
                    {
                        keywords_loading ? (
                            <>
                                <span> <span className="spinner small"> </span>  Loading keywords...</span>
                            </>
                        ) : (

                            account_keywords_array.map((account_keyword) => {
                                const is_active = (selected_keyword_filters || []).includes(account_keyword);
                                const counting = Number(
                                    account_keywords_counts_mapping?.[account_keyword] || "0",
                                ).toString();


                                return (

                                    <button
                                        type="button"
                                        key={account_keyword}
                                        className={`${styles.analysis_date_chip_item} ${is_active ? styles.active : ""
                                            }`}
                                        onClick={() => on_select_keyword_filter(account_keyword)}
                                        disabled={chips_disabled}
                                    >
                                        <span>{account_keyword}</span>
                                        <span className={styles.date_chip_count}>
                                            {counting}
                                        </span>
                                    </button>


                                )
                            })






                        )
                    }
                </div>
            </div>
        </div>
    );
}
