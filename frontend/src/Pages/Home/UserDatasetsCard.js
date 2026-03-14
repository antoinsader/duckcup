import { useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";

import DataTable from "../../components/reusable/Datatable/Datatable";
import ConfirmPopup from "../../components/reusable/Popup/ConfirmPopup";

import { delete_user_dataset } from "../../lib/backend/dataset";

import styles from "./Home.module.scss";


export default function UserDatasetsCard({ datasets_data, refresh_datasets }) {
  const [show_delete_confirm, set_show_delete_confirm] = useState(false);
  const delete_dataset = (row) => {
    try {
      const del_res = delete_user_dataset(row.dataset_id);
      if (del_res?.success) {
        toast.success("Dataset deleted successfully");
        refresh_datasets();
      } else {
        toast.error("Error deleting dataste");
      }
    } catch (ex) {
      toast.error("Error deleting dataste");
    }
  };

  return (
    <>
      <DataTable
        title={"User's datasets"}
        columns={[
          {
            field: "dataset_id",
            label: "Dataset number",
          },
          {
            field: "ds_name",
            label: "Dataset name",
          },
          {
            field: "count_emails",
            label: "Count emails",
          },
          {
            field: "actions",
            label: "Actions",
            actions: true,
            icon: <FaTrash />,
            click: (row) => set_show_delete_confirm(true),
          },
        ]}
        data={datasets_data}
          hide_rows_per_page={true}

      />
      {show_delete_confirm && (
        <ConfirmPopup
          title="Delete dataset"
          message="Are you sure you want to delete the dataset ?"
          yes_label="Yes, delete"
          yes_function={delete_dataset}
          close_function={() => set_show_delete_confirm(false)}
        />
      )}
    </>
  );
}
