#!/bin/sh

SECRETS_FILE="/app/data/.secrets"

# ── Auto-generate secrets on first run ─────────────────────────────────────
if [ ! -f "$SECRETS_FILE" ]; then
    echo ""
    echo "=== First run: generating secrets... ==="

    JWT=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
    PWD=$(python -c "import secrets; print(secrets.token_urlsafe(16))")
    ENC=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

    mkdir -p /app/data
    printf "JWT_SECRET_KEY=%s\nSPECIAL_PASSWORD=%s\nBACKEND_SECRETS_ENCRYPTION_KEY=%s\n" \
        "$JWT" "$PWD" "$ENC" > "$SECRETS_FILE"

    echo "=== Secrets saved to $SECRETS_FILE (do not delete this file) ==="
    echo ""
fi

# Export persisted secrets (takes precedence over any compose value)
export $(grep -v '^#' "$SECRETS_FILE" | xargs)

# ── Warn if Google credentials are missing ─────────────────────────────────
GOOGLE_WARN=0

if [ -z "$GOOGLE_CLIENT_ID" ] || [ "$GOOGLE_CLIENT_ID" = "your_google_client_id_here" ]; then
    GOOGLE_WARN=1
fi
if [ -z "$GOOGLE_CLIENT_SECRET" ] || [ "$GOOGLE_CLIENT_SECRET" = "your_google_client_secret_here" ]; then
    GOOGLE_WARN=1
fi

if [ "$GOOGLE_WARN" = "1" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  WARNING: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET        ║"
    echo "║  are not configured in docker-compose.yml.               ║"
    echo "║  Gmail connection will be unavailable.                   ║"
    echo "║  See: backend/README.md#setup-google-for-gmail-connection║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
fi

exec python main.py
