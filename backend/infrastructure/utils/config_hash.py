import hashlib
import json
from dataclasses import asdict, is_dataclass


def _normalize_for_hash(value):
    if is_dataclass(value):
        value = asdict(value)

    if isinstance(value, dict):
        return {str(k): _normalize_for_hash(v) for k, v in sorted(value.items(), key=lambda item: str(item[0]))}

    if isinstance(value, (list, tuple)):
        return [_normalize_for_hash(item) for item in value]

    if isinstance(value, set):
        return sorted(_normalize_for_hash(item) for item in value)

    if isinstance(value, (str, int, float, bool)) or value is None:
        return value

    if hasattr(value, "__dict__"):
        return _normalize_for_hash(vars(value))

    return str(value)


def hash_config(config) -> str:
    normalized = _normalize_for_hash(config)
    serialized = json.dumps(normalized, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()