from maillib.storage.sqlitestorage import StorageCol, SqliteTable

import time


class TempKeyStorage:
    """Save OAuth states temporarily in db"""
    def __init__(self, db_path):
        """db_path is sqlite path where to save the table"""
        cols = [
            StorageCol('key', 'TEXT', is_primary_key=True ),
            StorageCol('value', 'TEXT' ),
            StorageCol('expires_at', 'INTEGER' ),
        ]
        table = SqliteTable(db_path, "temporary_oauth_keys", cols)
        table.create_table()
        self.table = table
    def insert_key(self, key:str, val: str, expires_at: int):
        insert_dict = {
            "key": key,
            "value": val,
            "expires_at": expires_at
        }
        self.table.insert_into_table(insert_dict)
    def get_val(self, key):
        now = int(time.time())
        row = self.table.select_row('value, expires_at', {
            'key': key
        })
        if not row:
            return None
        value, expires_at = row
        if expires_at < now:
            where_dict = {
                "key": key
            }
            self.table.delete_row(where_dict)
            return None
        return value
    def delete_row(self, key):
        where_dict = {
            "key": key
        }
        self.table.delete_row(where_dict)
