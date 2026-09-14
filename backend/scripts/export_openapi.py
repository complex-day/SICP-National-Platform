import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app


def export_openapi():
    """Extract and export OpenAPI 3.1 JSON schema."""
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Docs", "openapi.json"))
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    openapi_schema = app.openapi()
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2)
        
    print(f"[SUCCESS] OpenAPI schema exported to {output_path}")


if __name__ == "__main__":
    export_openapi()
