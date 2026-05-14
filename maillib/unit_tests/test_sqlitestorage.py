import pytest
from maillib.storage.sqlitestorage import StorageCol, SqliteTable
from maillib.core.exceptions import INFRA_ERROR_LAYERS, InfrastructureError


class TestStorageCol:
    def test_col_type(self):
        col = StorageCol('name', 'text')
        col2 = StorageCol('name', 'INTEGER')
        assert col.col_type == 'TEXT'
        assert col2.col_type == 'INTEGER'

    def test_col_invalid_type(self):
        with pytest.raises(InfrastructureError) as exc_info:
            StorageCol('data', 'INVALID TYPE')
        assert exc_info.value.layer == INFRA_ERROR_LAYERS.SQLITE

    def test_col_primary(self):
        primary = StorageCol('id', 'INTEGER', is_primary_key=True)
        not_primary = StorageCol('id', 'INTEGER')
        assert 'PRIMARY KEY' in primary.col_def_str()
        assert 'PRIMARY KEY' not in not_primary.col_def_str()

    def test_col_nulls(self):
        col_not_nullable = StorageCol('name', 'TEXT')
        col_nullable = StorageCol('name', 'TEXT', is_null=True)
        assert 'NOT NULL' in col_not_nullable.col_def_str()
        assert 'NOT NULL' not in col_nullable.col_def_str()

    def test_col_def_str_contains_name_and_type(self):
        col = StorageCol('email', 'TEXT')
        result = col.col_def_str()
        assert 'email' in result
        assert 'TEXT' in result


class TestSqliteTable:
    @pytest.fixture
    def db_path(self, tmp_path):
        return str(tmp_path / 'test.db')

    @pytest.fixture
    def two_cols(self):
        return [
            StorageCol('id', 'INTEGER', is_primary_key=True),
            StorageCol('name', 'TEXT'),
        ]

    @pytest.fixture
    def three_cols(self):
        return [
            StorageCol('key', 'TEXT', is_primary_key=True),
            StorageCol('value', 'TEXT'),
            StorageCol('expires_at', 'INTEGER'),
        ]

    @pytest.fixture
    def table(self, db_path, two_cols):
        t = SqliteTable(db_path, 'users', two_cols)
        t.create_table()
        return t

    def test_get_connection_returns_connection(self, db_path, two_cols):
        table = SqliteTable(db_path, 'users', two_cols)
        conn = table.get_connection()
        assert conn is not None
        conn.close()

    def test_create_table_returns_true(self, db_path, two_cols):
        table = SqliteTable(db_path, 'users', two_cols)
        assert table.create_table() is True

    def test_create_table_idempotent(self, db_path, two_cols):
        table = SqliteTable(db_path, 'users', two_cols)
        table.create_table()
        assert table.create_table() is True

    def test_insert_and_select(self, table):
        table.insert_into_table({'id': 1, 'name': 'Alice'})
        row = table.select_row('id, name', {'id': 1})
        assert row == (1, 'Alice')

    def test_select_nonexistent_returns_none(self, table):
        row = table.select_row('id, name', {'id': 999})
        assert row is None

    def test_delete_removes_row(self, table):
        table.insert_into_table({'id': 1, 'name': 'Alice'})
        table.delete_row({'id': 1})
        assert table.select_row('id, name', {'id': 1}) is None

    def test_insert_or_replace_overwrites(self, table):
        table.insert_into_table({'id': 1, 'name': 'Alice'})
        table.insert_into_table({'id': 1, 'name': 'Bob'})
        row = table.select_row('name', {'id': 1})
        assert row[0] == 'Bob'

    def test_select_multiple_where_conditions(self, db_path, three_cols):
        table = SqliteTable(db_path, 'kv', three_cols)
        table.create_table()
        table.insert_into_table({'key': 'k1', 'value': 'v1', 'expires_at': 9999})
        table.insert_into_table({'key': 'k2', 'value': 'v2', 'expires_at': 9999})
        row = table.select_row('value', {'key': 'k1', 'expires_at': 9999})
        assert row[0] == 'v1'

    def test_delete_with_multiple_conditions(self, db_path, three_cols):
        table = SqliteTable(db_path, 'kv', three_cols)
        table.create_table()
        table.insert_into_table({'key': 'k1', 'value': 'v1', 'expires_at': 9999})
        table.delete_row({'key': 'k1', 'expires_at': 9999})
        assert table.select_row('value', {'key': 'k1'}) is None
