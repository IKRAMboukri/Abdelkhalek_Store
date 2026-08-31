import datetime as dt

UTC = dt.UTC


def utcnow() -> dt.datetime:
    """Naive UTC datetime suitable for storage in DateTime columns."""
    return dt.datetime.now(UTC).replace(tzinfo=None)


def to_iso(value: dt.datetime) -> str:
    """Serialize a (naive UTC) datetime with a Z suffix for the frontend."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")
