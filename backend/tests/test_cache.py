"""Unit tests for InMemoryLruCache (infrastructure/cache/cache_store.py)."""
import threading
import pytest

from infrastructure.cache.cache_store import InMemoryLruCache
from application.exceptions import InfrastructureError


class TestInMemoryLruCacheGet:
    def test_get_missing_key_returns_none(self):
        cache = InMemoryLruCache(max_size=10)
        assert cache.get(("missing", "key")) is None

    def test_get_after_set_returns_value(self):
        cache = InMemoryLruCache()
        cache.set(("k",), {"data": 42})
        result = cache.get(("k",))
        assert result == {"data": 42}

    def test_get_returns_deep_copy(self):
        """Mutating the returned object must not affect the cached value."""
        cache = InMemoryLruCache()
        original = {"nested": [1, 2, 3]}
        cache.set(("k",), original)

        fetched = cache.get(("k",))
        fetched["nested"].append(99)

        assert cache.get(("k",)) == {"nested": [1, 2, 3]}

    def test_get_moves_key_to_end(self):
        """Getting a key should promote it so it is not the next eviction target."""
        cache = InMemoryLruCache(max_size=3)
        cache.set(("a",), 1)
        cache.set(("b",), 2)
        cache.set(("c",), 3)

        # Access 'a' so 'b' becomes the LRU
        cache.get(("a",))

        # Adding a 4th entry evicts the LRU which should now be 'b'
        cache.set(("d",), 4)

        assert cache.get(("b",)) is None
        assert cache.get(("a",)) == 1
        assert cache.get(("c",)) == 3
        assert cache.get(("d",)) == 4


class TestInMemoryLruCacheSet:
    def test_set_overwrites_existing_key(self):
        cache = InMemoryLruCache()
        cache.set(("k",), "first")
        cache.set(("k",), "second")
        assert cache.get(("k",)) == "second"

    def test_set_stores_deep_copy(self):
        """Mutating the source object after set must not affect the cached entry."""
        cache = InMemoryLruCache()
        data = {"x": [1, 2]}
        cache.set(("k",), data)

        data["x"].append(99)

        assert cache.get(("k",)) == {"x": [1, 2]}

    def test_eviction_when_max_size_exceeded(self):
        cache = InMemoryLruCache(max_size=3)
        cache.set(("a",), 1)
        cache.set(("b",), 2)
        cache.set(("c",), 3)
        cache.set(("d",), 4)  # should evict 'a'

        assert cache.get(("a",)) is None
        assert cache.get(("d",)) == 4

    def test_cache_size_never_exceeds_max(self):
        max_size = 5
        cache = InMemoryLruCache(max_size=max_size)
        for i in range(20):
            cache.set((i,), i)
        assert len(cache._cache) <= max_size

    def test_max_size_one_keeps_only_latest(self):
        cache = InMemoryLruCache(max_size=1)
        cache.set(("first",), 1)
        cache.set(("second",), 2)
        assert cache.get(("first",)) is None
        assert cache.get(("second",)) == 2


class TestInMemoryLruCacheThreadSafety:
    def test_concurrent_writes_do_not_corrupt_cache(self):
        """Multiple threads writing concurrently should not raise errors."""
        cache = InMemoryLruCache(max_size=50)
        errors = []

        def writer(start):
            try:
                for i in range(start, start + 20):
                    cache.set((i,), {"value": i})
            except Exception as exc:
                errors.append(exc)

        threads = [threading.Thread(target=writer, args=(i * 20,)) for i in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert errors == [], f"Thread errors: {errors}"
