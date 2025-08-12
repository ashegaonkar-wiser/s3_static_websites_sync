# S3 Static Website Sync

Python scripts for syncing local website files with AWS S3 buckets for static website hosting.

## Scripts

### s3_upload.py

Uploads local files to S3 bucket with proper MIME types.

**Features:**

- Upload all files or only Git-detected changes
- Automatic content type detection
- Preserves folder structure

**Usage:**

```bash
uv run s3_upload.py
```

### s3_sync.py

Downloads all files from S3 bucket to local folder.

**Features:**

- Downloads entire bucket contents
- Preserves folder structure
- Overwrites existing files

**Usage:**

```bash
uv run s3_sync.py
```
