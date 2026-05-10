import time
import threading
import pytest

from maillib.core.caching import LruCachingMemory

@pytest.fixture
def cache():
    return LruCachingMemory(max_size=3)


@pytest.fixture
def expiring_cache():
    return LruCachingMemory(max_size=10, expiration_minutes=1/60)

class TestLRUCaching:
    def test_get_missing_key(self, cache):
        assert cache.get("missing") is None
    def test_put_and_get(self, cache):
        cache_key = "cache_key"
        cache_val = {"a": 1, "b": 2}
        cache.put(cache_key, cache_val)
        assert cache.get(cache_key) == cache_val
    def test_put_existing_keys(self, cache):
        cache_key = "cache_key"
        cache.put(cache_key, "first")
        cache.put(cache_key, "second")
        assert cache.get(cache_key) == "second"
    def test_max_size(self):
        c = LruCachingMemory(max_size=2)
        c.put("a", 1)
        c.put("b", 2)
        c.put("c", 3)
        assert c.get("a") is None
        assert c.get("b")  == 2
        assert c.get("c")  == 3

    def test_after_expiration(self, expiring_cache):
        cache_key = "cache_key"
        expiring_cache.put(cache_key, "value")
        time.sleep(1.1)
        assert expiring_cache.get(cache_key) is None

    def test_before_expiration(self, expiring_cache):
        cache_key = "cache_key"
        expiring_cache.put(cache_key, "value")
        assert expiring_cache.get(cache_key) == "value"
