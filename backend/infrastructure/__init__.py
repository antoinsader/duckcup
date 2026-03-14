
# technical parsing
    # it depends on:
    # email standards
    # raw external input format
# Infrastructure should be consumed only by application.
# If tomorrow you switch from IMAP to API-based Gmail JSON, this logic changes.
# That means it is volatile.
# Volatile things belong in infrastructure.

# How do we talk to the outside world?

# It includes:
#     Databases
#     Email servers
#     OpenAI
#     Ollama
#     FAISS
#     File system
#     HTTP framework

# If Gmail shuts down tomorrow, infrastructure changes.
# Examples:
    # GmailImapService
    # Embedding providers
    # SQLite repositories
    # File storage
    # MIME decoding

# If this code depends on external libraries or protocols, it’s infrastructure.