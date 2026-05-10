import threading
from collections import OrderedDict
import time
import copy

from maillib.core.exceptions import INFRA_ERROR_LAYERS, InfrastructureError

class LruCachingMemory:
    """ Class to cache dict-arrays in memory
    Explanation:
        Store OrderedDict { cache_key: tuple (value, timestamp)} 
    methods:
        put(cache_key: str, value: any)
        get(cache_key: str ) -> any
    args:
        max_size: int
            for the same cache, how many items can be saved
        expiration_minutes: int
            Expires after how many minutes
    """
    def __init__(self, max_size: int= 24, expiration_minutes: int = None):
        self.max_size = max_size
        self.expiration_minutes = expiration_minutes

        self._cache = OrderedDict()
        self._lock = threading.Lock()

    def put(self, cache_key: str, value):
        """ Steps:
            If cache_key exists => move to end.
            Add to _cache dictionary with timestamp
            Remove expired caches
            Remove from cache first items if max_size reached
        """
        try:
            with self._lock:
                now = time.time()
                if cache_key in self._cache:
                    self._cache.move_to_end(cache_key)
                self._cache[cache_key] = (copy.deepcopy(value), now)

                if self.expiration_minutes is not None:
                    _expired_keys = [k for k, (_, ts) in self._cache.items()
                                        if now - ts > self.expiration_minutes * 60]
                    for k in _expired_keys:
                        self._cache.pop(k, None)
                while len(self._cache) > self.max_size:
                    self._cache.popitem(last= False)
        except Exception as ex:
            raise InfrastructureError(
                f"Error caching data with cache_key: {cache_key}",
                layer=INFRA_ERROR_LAYERS.CACHING,
                priority=1,
                ex=ex
            )

    def get(self, cache_key):
        """If not expired then return value and move to the end
        """
        try:
            with self._lock:
                item = self._cache.get(cache_key)
                if item is None:
                    return None
                value, timestamp = item
                if self.expiration_minutes is not None:
                    now = time.time()
                    if now - timestamp > self.expiration_minutes * 60:
                        # Expired
                        self._cache.pop(cache_key, None)
                        return None
                self._cache.move_to_end(cache_key)
                return copy.deepcopy(value)

        except Exception as ex:
            raise InfrastructureError(
                f"Error getting cache data from cache_key: {cache_key}",
                layer=INFRA_ERROR_LAYERS.CACHING,
                priority=1,
                ex=ex
            )