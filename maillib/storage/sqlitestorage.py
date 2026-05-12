
import sqlite3
from maillib.core.exceptions import InfrastructureError, INFRA_ERROR_LAYERS

class StorageCol:
    COL_TYPES = ["TEXT", "INTEGER"]
    def __init__(
            self,
            col_name: str,
            col_type: str,
            is_primary_key:bool = False, 
            is_null: bool = False
        ):
        if col_type.upper() not in self.COL_TYPES:
            raise InfrastructureError(
                f"Col type: {col_type} is not valid from the list {self.COL_TYPES}",
                layer=INFRA_ERROR_LAYERS.SQLITE,
                priority=1,
            )
        self.col_name = col_name
        self.col_type = col_type.upper()
        self.primary_str = " PRIMARY KEY " if is_primary_key else ""
        self.null_str = "" if is_null else " NOT NULL "
    def col_def_str(self):
        return f" {self.col_name} {self.col_type} {self.primary_str} {self.null_str} "

class SqliteTable:
    def __init__(self, db_path, table_name: str, cols: list[StorageCol]):
        """db_path is the path to sqlite database"""
        self.db_path = db_path
        self.table_name = table_name
        self.cols = cols

    def get_connection(self):
        try:
            return sqlite3.connect(self.db_path)
        except Exception as ex:
            raise InfrastructureError(
                f"Error connecting to sqlite in path: {self.db_path}",
                layer=INFRA_ERROR_LAYERS.SQLITE,
                priority=1,
                ex=ex
            )

    def create_table(self, ):
        try:
            with self.get_connection() as conn:
                cols_str = ", ".join(c.col_def_str() for c in self.cols)
                conn.execute(f"""
                        CREATE TABLE IF NOT EXISTS {self.table_name} ({cols_str})
                    """)
                conn.commit()
                return True
        except Exception as ex:
            raise InfrastructureError(
                f"Error creating table: {self.table_name} in sql lite",
                layer=INFRA_ERROR_LAYERS.SQLITE,
                priority=1,
                ex=ex,
                back_details={'cols': self.cols}
            )

    def insert_into_table(self, insert_dict: dict ):
        """Example insert_into_table(table_name='temp_secrets', cols_names_str='key, value, expires_at', values_tuple(1,2,3) ) """
        try:
            with self.get_connection() as conn:
                insert_cols = tuple(insert_dict.keys())
                insert_placeholders = ", ".join("?" for _ in insert_dict)
                insert_values = tuple(insert_dict.values())

                conn.execute(f"""
                    INSERT OR REPLACE INTO {self.table_name} {insert_cols}
                    VALUES ({insert_placeholders})
                    """, insert_values)
                conn.commit()
                return True
        except Exception as ex:
            raise InfrastructureError(
                f"Error creating table: {self.table_name} in sql lite",
                layer=INFRA_ERROR_LAYERS.SQLITE,
                priority=1,
                ex=ex,
                back_details={'insert_dict': insert_dict }
            )
    def select_row(self, cols_names: str, where_dict: dict):
        try:
            with self.get_connection() as conn:
                where_str = " AND ".join(f"{col} = ?" for col in where_dict)
                where_vals = tuple(where_dict.values())
                cursor = conn.execute(f"""
                        SELECT {cols_names}
                        from {self.table_name}
                        where {where_str}
                    """, where_vals)
                row = cursor.fetchone()
                return row
        except Exception as ex:
            raise InfrastructureError(
                f"Error selecting from table: {self.table_name} in sql lite, cols: {cols_names}, where: {where_dict}",
                layer=INFRA_ERROR_LAYERS.SQLITE,
                ex=ex,
            )
    def delete_row(self, where_dict:dict):
        try:
            where_str = " AND ".join(f"{col} = ?" for col in where_dict)
            where_vals = tuple(where_dict.values())
            with self.get_connection() as conn:
                conn.execute(f"""
                        DELETE FROM {self.table_name}
                        where {where_str}
                    """, where_vals)
                conn.commit()
        except Exception as ex:
            raise InfrastructureError(
                f"Error deleting from table: {self.table_name} in sql lite, where: {where_str}",
                layer=INFRA_ERROR_LAYERS.SQLITE,
                ex=ex,
            )
