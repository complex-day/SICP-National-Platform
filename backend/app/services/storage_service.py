import os
import uuid
import asyncio
from abc import ABC, abstractmethod
from typing import BinaryIO, Tuple
from fastapi import UploadFile
from app.core.exceptions import PayloadTooLargeError, UnsupportedMediaTypeError

# Allowed MIME Types & Size Caps
ALLOWED_MIME_TYPES = {
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
    "application/pdf": "document",
    "video/mp4": "video",
    "video/quicktime": "video",
}

MAX_FILE_SIZES = {
    "image": 10 * 1024 * 1024,      # 10 MB
    "document": 20 * 1024 * 1024,   # 20 MB
    "video": 100 * 1024 * 1024,     # 100 MB
}

# Magic byte signatures for spoofing detection
MAGIC_SIGNATURES = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
    "application/pdf": [b"%PDF"],
    "video/mp4": [b"\x00\x00\x00\x18ftyp", b"\x00\x00\x00\x20ftyp", b"ftypisom", b"ftypmp42"],
}


class BaseStorageService(ABC):
    """Abstract file storage service interface ready for Local, S3, and MinIO."""

    @abstractmethod
    async def upload_file(
        self, upload_file: UploadFile, media_type: str, destination_folder: str
    ) -> Tuple[str, str, int, str]:
        """Uploads file and returns (storage_url, safe_filename, file_size_bytes, mime_type)."""
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """Deletes file at path."""
        pass


class LocalStorageService(BaseStorageService):
    """Local filesystem storage implementation for development and testing."""

    def __init__(self, base_upload_dir: str = "uploads"):
        self.base_upload_dir = base_upload_dir
        os.makedirs(self.base_upload_dir, exist_ok=True)

    def validate_file(self, upload_file: UploadFile, header_bytes: bytes, file_size: int):
        # 1. MIME Validation
        content_type = upload_file.content_type or "application/octet-stream"
        if content_type not in ALLOWED_MIME_TYPES:
            raise UnsupportedMediaTypeError(
                f"Content type '{content_type}' is not permitted. Allowed: {list(ALLOWED_MIME_TYPES.keys())}"
            )

        category = ALLOWED_MIME_TYPES[content_type]
        max_size = MAX_FILE_SIZES.get(category, 10 * 1024 * 1024)

        # 2. Size Validation
        if file_size > max_size:
            raise PayloadTooLargeError(
                f"File size ({file_size} bytes) exceeds the maximum allowed {max_size} bytes for {category}."
            )

        # 3. Magic Byte Signature Verification
        expected_sigs = MAGIC_SIGNATURES.get(content_type, [])
        if expected_sigs:
            matched = any(header_bytes.startswith(sig) or sig in header_bytes[:32] for sig in expected_sigs)
            if not matched:
                raise UnsupportedMediaTypeError(
                    f"File header signature does not match declared MIME type '{content_type}'."
                )

    async def upload_file(
        self, upload_file: UploadFile, media_type: str, destination_folder: str
    ) -> Tuple[str, str, int, str]:
        content = await upload_file.read()
        file_size = len(content)

        # Validate
        self.validate_file(upload_file, content[:32], file_size)

        # Safe filename generation to prevent path traversal
        orig_ext = os.path.splitext(upload_file.filename or "")[1].lower()
        if not orig_ext or orig_ext in [".exe", ".bat", ".sh", ".py", ".js"]:
            if upload_file.content_type == "image/jpeg":
                orig_ext = ".jpg"
            elif upload_file.content_type == "image/png":
                orig_ext = ".png"
            elif upload_file.content_type == "application/pdf":
                orig_ext = ".pdf"
            else:
                orig_ext = ".bin"

        safe_filename = f"{uuid.uuid4()}{orig_ext}"
        target_dir = os.path.join(self.base_upload_dir, destination_folder)
        os.makedirs(target_dir, exist_ok=True)

        target_filepath = os.path.join(target_dir, safe_filename)
        
        def _write_bytes(filepath: str, data: bytes):
            with open(filepath, "wb") as f:
                f.write(data)

        await asyncio.to_thread(_write_bytes, target_filepath, content)

        storage_url = f"/static/uploads/{destination_folder}/{safe_filename}"
        mime_type = upload_file.content_type or "application/octet-stream"

        return storage_url, upload_file.filename or safe_filename, file_size, mime_type

    async def delete_file(self, file_path: str) -> bool:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
