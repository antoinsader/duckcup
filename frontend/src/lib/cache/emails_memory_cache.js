const EMAILS_CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHED_ACCOUNTS = 2;
const MAX_CACHED_EMAILS = 200;

const emails_memory_cache = new Map();

const is_object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const stable_serialize = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stable_serialize(item)).join(",")}]`;
  }

  if (is_object(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable_serialize(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
};

const is_cache_fresh = (cache_date, max_age_ms) => {
  if (!cache_date) return false;

  const cache_time = new Date(cache_date).getTime();
  if (Number.isNaN(cache_time)) return false;

  return Date.now() - cache_time <= max_age_ms;
};

export const get_cache_minutes_ago = (cache_date) => {
  if (!cache_date) return null;

  const cache_time = new Date(cache_date).getTime();
  if (Number.isNaN(cache_time)) return null;

  const diff_ms = Date.now() - cache_time;
  return Math.max(0, Math.floor(diff_ms / (60 * 1000)));
};

const get_now_iso = () => new Date().toISOString();

const get_account_cache = (account_id) => {
  return emails_memory_cache.get(account_id) || null;
};

const touch_account_cache = (account_id) => {
  const account_cache = get_account_cache(account_id);
  if (!account_cache) return;

  account_cache.last_accessed_at = get_now_iso();
};

const ensure_account_cache = (account_id) => {
  if (!account_id) return null;

  let account_cache = get_account_cache(account_id);
  if (!account_cache) {
    account_cache = {
      last_accessed_at: get_now_iso(),
      meta_entry: null,
      page_entries: new Map(),
    };
    emails_memory_cache.set(account_id, account_cache);
  }

  touch_account_cache(account_id);
  return account_cache;
};

const evict_accounts_lru = () => {
  if (emails_memory_cache.size <= MAX_CACHED_ACCOUNTS) return;

  const sorted_accounts = [...emails_memory_cache.entries()].sort((a, b) => {
    const a_time = new Date(a[1].last_accessed_at || 0).getTime();
    const b_time = new Date(b[1].last_accessed_at || 0).getTime();
    return a_time - b_time;
  });

  while (emails_memory_cache.size > MAX_CACHED_ACCOUNTS && sorted_accounts.length) {
    const [account_id] = sorted_accounts.shift();
    emails_memory_cache.delete(account_id);
    console.log("[EmailsCache] account evicted by LRU", { account_id });
  }
};

const get_total_cached_emails = () => {
  let total_cached_emails = 0;

  emails_memory_cache.forEach((account_cache) => {
    account_cache.page_entries.forEach((entry) => {
      total_cached_emails += Number(entry.email_count) || 0;
    });
  });

  return total_cached_emails;
};

const evict_page_entries_global_lru = () => {
  let total_cached_emails = get_total_cached_emails();
  if (total_cached_emails <= MAX_CACHED_EMAILS) return;

  const all_page_entries = [];
  emails_memory_cache.forEach((account_cache, account_id) => {
    account_cache.page_entries.forEach((entry, page_key) => {
      all_page_entries.push({
        account_id,
        page_key,
        last_accessed_at: entry.last_accessed_at,
      });
    });
  });

  all_page_entries.sort((a, b) => {
    const a_time = new Date(a.last_accessed_at || 0).getTime();
    const b_time = new Date(b.last_accessed_at || 0).getTime();
    return a_time - b_time;
  });

  while (total_cached_emails > MAX_CACHED_EMAILS && all_page_entries.length) {
    const oldest_entry = all_page_entries.shift();
    const account_cache = get_account_cache(oldest_entry.account_id);
    if (!account_cache) continue;

    const page_entry = account_cache.page_entries.get(oldest_entry.page_key);
    if (!page_entry) continue;

    total_cached_emails -= Number(page_entry.email_count) || 0;
    account_cache.page_entries.delete(oldest_entry.page_key);

    console.log("[EmailsCache] page evicted by global LRU", {
      account_id: oldest_entry.account_id,
      page_key: oldest_entry.page_key,
      evicted_emails_count: Number(page_entry.email_count) || 0,
      remaining_cached_emails: Math.max(0, total_cached_emails),
    });
  }
};

export const build_emails_page_cache_key = ({
  account_id,
  criteria_data,
  page_num,
  num_rows,
}) => {
  return `${account_id}:${page_num}:${num_rows}:${stable_serialize(criteria_data || {})}`;
};

export const get_meta_from_memory_cache = (account_id) => {
  const account_cache = get_account_cache(account_id);
  if (!account_cache?.meta_entry) return null;

  if (!is_cache_fresh(account_cache.meta_entry.cached_at, EMAILS_CACHE_TTL_MS)) {
    account_cache.meta_entry = null;
    return null;
  }

  const now_iso = get_now_iso();
  account_cache.meta_entry.last_accessed_at = now_iso;
  account_cache.last_accessed_at = now_iso;

  return {
    data: account_cache.meta_entry.data,
    cached_at: account_cache.meta_entry.cached_at,
  };
};

export const set_meta_in_memory_cache = (account_id, meta_data) => {
  const account_cache = ensure_account_cache(account_id);
  if (!account_cache) return;

  const now_iso = get_now_iso();
  account_cache.meta_entry = {
    data: meta_data,
    cached_at: now_iso,
    last_accessed_at: now_iso,
  };
  account_cache.last_accessed_at = now_iso;

  evict_accounts_lru();
};

export const get_page_from_memory_cache = (account_id, page_key) => {
  const account_cache = get_account_cache(account_id);
  if (!account_cache) return null;

  const page_entry = account_cache.page_entries.get(page_key);
  if (!page_entry) return null;

  if (!is_cache_fresh(page_entry.cached_at, EMAILS_CACHE_TTL_MS)) {
    account_cache.page_entries.delete(page_key);
    return null;
  }

  const now_iso = get_now_iso();
  page_entry.last_accessed_at = now_iso;
  account_cache.last_accessed_at = now_iso;

  return page_entry;
};

export const set_page_in_memory_cache = (account_id, page_key, page_payload) => {
  const account_cache = ensure_account_cache(account_id);
  if (!account_cache) return;

  const now_iso = get_now_iso();
  const rows = Array.isArray(page_payload?.rows) ? page_payload.rows : [];

  account_cache.page_entries.set(page_key, {
    ...page_payload,
    rows,
    cached_at: now_iso,
    last_accessed_at: now_iso,
    email_count: rows.length,
  });
  account_cache.last_accessed_at = now_iso;

  evict_accounts_lru();
  evict_page_entries_global_lru();
};

export const clearEmailsMemoryCache = () => {
  const cached_accounts_count = emails_memory_cache.size;
  emails_memory_cache.clear();

  console.log("[EmailsCache] cache cleared", {
    cached_accounts_count,
  });
};