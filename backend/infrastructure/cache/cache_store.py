from collections import OrderedDict
import copy
import threading

from application.exceptions import InfrastructureError, INFRA_ERROR_LAYERS



import time

class InMemoryLruCache:
    def __init__(self, max_size: int = 256, expiration_minutes: int = None):
        self.max_size = max_size
        self.expiration_minutes = expiration_minutes
        # Store (value, timestamp) pairs
        self._cache: OrderedDict[tuple, tuple] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, cache_key: tuple):
        with self._lock:
            item = self._cache.get(cache_key)
            if item is None:
                return None

            value, timestamp = item
            if self.expiration_minutes is not None:
                now = time.time()
                if now - timestamp > self.expiration_minutes * 60:
                    # Expired, remove from cache
                    self._cache.pop(cache_key, None)
                    return None

            self._cache.move_to_end(cache_key)
            try:
                return copy.deepcopy(value)
            except Exception as ex:
                raise InfrastructureError(
                    "Failed to deserialize cached value",
                    layer=INFRA_ERROR_LAYERS.UTILS,
                    priority=2,
                    ex=ex
                )

    def set(self, cache_key: tuple, value):
        with self._lock:
            now = time.time()
            try:
                # Store (value, timestamp)
                self._cache[cache_key] = (copy.deepcopy(value), now)
            except Exception as ex:
                raise InfrastructureError(
                    "Failed to serialize value for caching",
                    layer=INFRA_ERROR_LAYERS.UTILS,
                    priority=2,
                    ex=ex
                )
            self._cache.move_to_end(cache_key)

            # Remove expired items if expiration is set
            if self.expiration_minutes is not None:
                expired_keys = [k for k, (_, ts) in self._cache.items()
                                if now - ts > self.expiration_minutes * 60]
                for k in expired_keys:
                    self._cache.pop(k, None)

            while len(self._cache) > self.max_size:
                self._cache.popitem(last=False)
