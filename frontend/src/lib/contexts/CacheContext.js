import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { LOCAL_STORAGE_KEYS } from "../config/local_storage_keys";

const CacheContext = createContext(null);

export function CacheProvider({ children }) {
  const local_storage_keys = LOCAL_STORAGE_KEYS;
  const getCache = useCallback((key) => {
    const content = localStorage.getItem(key);
    if (!content) return [null, null];
    const parsed_content = JSON.parse(content);
    const date = parsed_content.date;
    const data = parsed_content.data;

    return [data, date];
  }, []);
  const setCache = useCallback((key, value) => {
    // if (!Object.values(local_storage_keys).includes(key)) return;
    const content = {
      date: new Date(),
      data: value,
    };
    localStorage.setItem(key, JSON.stringify(content));
    return true;
  }, []);

  return (
    <CacheContext.Provider value={{ local_storage_keys, getCache, setCache }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  return useContext(CacheContext);
}
export function useCachedState(key, defaultValue) {
  const { getCache, setCache } = useCache();

  // 1. Initialize state from cache (runs once on mount)
  const [value, setValue] = useState(() => {
    const [cachedData] = getCache(key);
    return cachedData !== null ? cachedData : defaultValue;
  });

  // 2. Single effect to keep localStorage in sync with state
  useEffect(() => {
    setCache(key, value);
  }, [key, value, setCache]);

  return [value, setValue];
}
