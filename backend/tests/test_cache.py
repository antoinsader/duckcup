import time

from infrastructure.cache.cache_store import InMemoryLruCache



def test_in_memory_lru_cache():


    # test expiration
    secs = 2
    minutes = secs / 60
    cache = InMemoryLruCache(max_size=2, expiration_minutes=minutes)
    cache.set("key1", "value1")
    time.sleep(4)
    assert cache.get("key1") is None, "Expected 'key1' to be expired and return None"

    cache = InMemoryLruCache(max_size=4, expiration_minutes=10)
    values_1= [1,2,3,4]
    values_2= [1,2,3,4]
    values_3= [1,2,3,4]
    cache.set("key1", values_1)
    cache.set("key2", values_2)
    cache.set("key3", values_3)
    assert cache.get("key1")  == values_1, f"cache value returned {cache.get('key1')} instead of {values_1}"
    assert cache.get("key2")  == values_2, f"cache value returned {cache.get('key2')} instead of {values_2}"
    assert cache.get("key3")  == values_3, f"cache value returned {cache.get('key3')} instead of {values_3}"


