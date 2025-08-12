#!/usr/bin/env python3

import os
import subprocess
import boto3
import mimetypes
from botocore.exceptions import NoCredentialsError, ClientError


def list_project_folders():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    folders = []
    for item in os.listdir(script_dir):
        item_path = os.path.join(script_dir, item)
        if (
            os.path.isdir(item_path)
            and not item.startswith(".")
            and item != "__pycache__"
        ):
            folders.append(item)
    return sorted(folders)


def select_bucket():
    folders = list_project_folders()
    if not folders:
        print("No folders found in project directory")
        return None

    print("\nAvailable project folders (S3 bucket names):")
    for i, folder in enumerate(folders, 1):
        print(f"{i}. {folder}")

    while True:
        try:
            choice = input(f"\nSelect folder/bucket (1-{len(folders)}): ").strip()
            if choice.lower() == "q":
                return None
            index = int(choice) - 1
            if 0 <= index < len(folders):
                return folders[index]
            else:
                print(f"Please enter a number between 1 and {len(folders)}")
        except ValueError:
            print("Please enter a valid number or 'q' to quit")


def get_git_changed_files(local_folder):
    """Get list of changed files from git status and diff"""
    try:
        # Get staged and unstaged changes
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
        )
        changed_files = (
            result.stdout.strip().split("\n") if result.stdout.strip() else []
        )

        # Get untracked files
        result = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            capture_output=True,
            text=True,
            check=True,
        )
        untracked_files = (
            result.stdout.strip().split("\n") if result.stdout.strip() else []
        )

        all_files = changed_files + untracked_files

        # Filter to only files in the target folder
        folder_files = []
        for file in all_files:
            if file and file.startswith(local_folder + "/"):
                filename = os.path.basename(file)
                if not filename.startswith(".") and not filename.endswith(".py"):
                    if os.path.isfile(file):
                        folder_files.append(file)

        return folder_files

    except subprocess.CalledProcessError:
        return None
    except FileNotFoundError:
        return None


def upload_to_s3(local_folder, bucket_name, s3_prefix="", changed_files_only=False):
    try:
        s3_client = boto3.client("s3")

        files_to_upload = []

        if changed_files_only:
            # Use git to find changed files
            git_files = get_git_changed_files(local_folder)
            if git_files is None:
                print("Git not available or not a git repository. Uploading all files.")
                changed_files_only = False
            elif not git_files:
                print("No changed files detected by Git.")
                return
            else:
                print(f"Git detected {len(git_files)} changed files:")
                for file in git_files:
                    print(f"  {os.path.relpath(file, local_folder)}")
                files_to_upload = git_files

        if not changed_files_only:
            # Upload all files (original behavior)
            for root, dirs, files in os.walk(local_folder):
                for file in files:
                    if file.startswith(".") or file.endswith(".py"):
                        continue
                    files_to_upload.append(os.path.join(root, file))

        if not files_to_upload:
            print("No files to upload.")
            return

        print(f"\nUploading {len(files_to_upload)} files...")

        for local_path in files_to_upload:
            relative_path = os.path.relpath(local_path, local_folder)
            s3_key = relative_path.replace("\\", "/")

            content_type, _ = mimetypes.guess_type(local_path)
            if content_type is None:
                content_type = "application/octet-stream"

            extra_args = {"ContentType": content_type}
            s3_client.upload_file(local_path, bucket_name, s3_key, ExtraArgs=extra_args)
            print(f"Uploaded: {s3_key} ({content_type})")

    except NoCredentialsError:
        print(
            "AWS credentials not found. Configure AWS CLI or set environment variables."
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchBucket":
            print(f"Error: S3 bucket '{bucket_name}' does not exist")
        else:
            print(f"Error: {e}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))

    selected_folder = select_bucket()
    if not selected_folder:
        print("No folder selected")
        exit(1)

    local_folder = os.path.join(script_dir, selected_folder)
    bucket_name = selected_folder
    s3_prefix = selected_folder

    if not os.path.exists(local_folder):
        print(f"Error: Folder {local_folder} does not exist")
        exit(1)

    # Ask user if they want to upload only changed files
    use_git = (
        input("\nUpload only changed files (detected by Git)? (y/N): ").strip().lower()
        == "y"
    )

    if use_git:
        print(f"\nChecking for changed files in '{selected_folder}' using Git...")
    else:
        print(
            f"\nUploading all files in folder '{selected_folder}' to S3 bucket '{bucket_name}'"
        )

    upload_to_s3(local_folder, bucket_name, s3_prefix, changed_files_only=use_git)
