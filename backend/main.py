import os
import uvicorn
from api.core.db import setup_db
from api.core import settings






if __name__ == "__main__":
    setup_db()
    os.makedirs("./data", exist_ok=True)
    port = int(settings.port)
    host = settings.host
    print(f"Starting server on {host}:{port}")
    uvicorn.run(
        "api.router:app",
        host=host,
        port=port,
        reload=True,
        reload_excludes=["unit_tests/*", "unit_tests/**"],
    )