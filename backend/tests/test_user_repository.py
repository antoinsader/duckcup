"""
Unit tests for user-related repository classes
(application/repositories/userRepository.py):
  - PasswordHasher
  - UserAuthController
"""
import pytest

from application.repositories.userRepository import PasswordHasher, UserAuthController
from application.exceptions import ApplicationError


# ---------------------------------------------------------------------------
# PasswordHasher
# ---------------------------------------------------------------------------

class TestPasswordHasher:
    def test_hash_returns_string(self):
        hasher = PasswordHasher()
        assert isinstance(hasher.hash("secret"), str)

    def test_hash_is_not_plaintext(self):
        hasher = PasswordHasher()
        hashed = hasher.hash("secret")
        assert hashed != "secret"

    def test_verify_correct_password_returns_true(self):
        hasher = PasswordHasher()
        hashed = hasher.hash("my_password")
        assert hasher.verify("my_password", hashed) is True

    def test_verify_wrong_password_returns_false(self):
        hasher = PasswordHasher()
        hashed = hasher.hash("correct")
        assert hasher.verify("wrong", hashed) is False

    def test_same_password_produces_different_hashes(self):
        """scrypt uses a random salt — two hashes of the same password must differ."""
        hasher = PasswordHasher()
        h1 = hasher.hash("password")
        h2 = hasher.hash("password")
        assert h1 != h2

    def test_verify_with_hash_from_different_hasher_instance(self):
        """Verification should work regardless of the hasher instance used."""
        hasher1 = PasswordHasher()
        hasher2 = PasswordHasher()
        hashed = hasher1.hash("shared_password")
        assert hasher2.verify("shared_password", hashed) is True


# ---------------------------------------------------------------------------
# UserAuthController
# ---------------------------------------------------------------------------

class TestUserAuthController:
    def test_create_user_returns_user_front(self, db_session):
        ctrl = UserAuthController(db_session)
        user = ctrl.create_user("alice", "pass123")
        assert user.username == "alice"
        assert user.user_id is not None

    def test_check_user_exists_true_after_creation(self, db_session):
        ctrl = UserAuthController(db_session)
        ctrl.create_user("bob", "pass")
        assert ctrl.check_user_exists("bob") is True

    def test_check_user_exists_false_for_unknown(self, db_session):
        ctrl = UserAuthController(db_session)
        assert ctrl.check_user_exists("no_such_user") is False

    def test_get_by_usernamepassword_valid_credentials(self, db_session):
        ctrl = UserAuthController(db_session)
        ctrl.create_user("carol", "secure!")
        result = ctrl.get_by_usernamepassword("carol", "secure!")
        assert result is not None
        assert result.username == "carol"

    def test_get_by_usernamepassword_wrong_password_returns_none(self, db_session):
        ctrl = UserAuthController(db_session)
        ctrl.create_user("dave", "rightpass")
        result = ctrl.get_by_usernamepassword("dave", "wrongpass")
        assert result is None

    def test_get_by_usernamepassword_nonexistent_user_returns_none(self, db_session):
        ctrl = UserAuthController(db_session)
        result = ctrl.get_by_usernamepassword("ghost", "any")
        assert result is None

    def test_create_duplicate_username_raises_application_error(self, db_session):
        ctrl = UserAuthController(db_session)
        ctrl.create_user("eve", "pass")
        with pytest.raises(ApplicationError):
            ctrl.create_user("eve", "different_pass")

    def test_get_all_users_returns_list(self, db_session):
        ctrl = UserAuthController(db_session)
        ctrl.create_user("frank", "p1")
        ctrl.create_user("grace", "p2")
        users = ctrl.get_all_user()
        assert isinstance(users, list)
        assert len(users) == 2

    def test_get_all_users_empty_db(self, db_session):
        ctrl = UserAuthController(db_session)
        assert ctrl.get_all_user() == []

    def test_delete_existing_user_returns_true(self, db_session):
        ctrl = UserAuthController(db_session)
        user = ctrl.create_user("henry", "pass")
        assert ctrl.delete_user(user.user_id) is True
        assert ctrl.check_user_exists("henry") is False

    def test_delete_nonexistent_user_returns_false(self, db_session):
        ctrl = UserAuthController(db_session)
        assert ctrl.delete_user(99999) is False

    def test_user_count_decreases_after_deletion(self, db_session):
        ctrl = UserAuthController(db_session)
        u1 = ctrl.create_user("iris", "p")
        ctrl.create_user("jack", "p")
        ctrl.delete_user(u1.user_id)
        assert len(ctrl.get_all_user()) == 1

    def test_password_is_stored_hashed_not_plaintext(self, db_session):
        """Verify the DB row does not contain the raw password."""
        from domain.db_models.User import User as UserModel

        ctrl = UserAuthController(db_session)
        ctrl.create_user("kim", "mysecret")
        db_user = db_session.query(UserModel).filter_by(username="kim").first()
        assert db_user.password != "mysecret"
