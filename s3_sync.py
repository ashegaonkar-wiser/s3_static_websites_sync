#!/usr/bin/env python3

import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError


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


def download_from_s3(local_folder, bucket_name, s3_prefix=""):
    try:
        s3_client = boto3.client("s3")

        os.makedirs(local_folder, exist_ok=True)

        paginator = s3_client.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=bucket_name)

        for page in pages:
            if "Contents" not in page:
                print(f"No files found in S3 bucket '{bucket_name}'")
                return

            for obj in page["Contents"]:
                s3_key = obj["Key"]

                if s3_key.endswith("/"):
                    continue

                local_path = os.path.join(local_folder, s3_key)
                local_dir = os.path.dirname(local_path)

                os.makedirs(local_dir, exist_ok=True)

                s3_client.download_file(bucket_name, s3_key, local_path)
                print(f"Downloaded: {s3_key}")

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

    print(
        f"\nDownloading from S3 bucket '{bucket_name}' to local folder '{selected_folder}'"
    )
    download_from_s3(local_folder, bucket_name, s3_prefix)
