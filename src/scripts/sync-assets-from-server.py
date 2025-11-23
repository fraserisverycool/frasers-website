import paramiko
import os
import stat

LOCAL_FOLDER = "../assets/"      # Where files will be stored locally
REMOTE_FOLDER = "/var/www/images"  # Folder on your server
PI_HOST = "192.168.2.153"  # Replace with your IP Address
PI_USER = "fraserbowen"  # Replace with your username
PI_PASSWORD = "BigCheeseForever1!"  # Replace with your password
PI_KEY_PATH = None  # Path to private key if using key auth

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

# Connect using key or password
if PI_KEY_PATH:
  key = paramiko.RSAKey.from_private_key_file(PI_KEY_PATH)
  ssh.connect(PI_HOST, username=PI_USER, pkey=key)
else:
  ssh.connect(PI_HOST, username=PI_USER, password=PI_PASSWORD)

sftp = ssh.open_sftp()


def ensure_local_dir(local_dir):
  """Create local directories if needed."""
  if not os.path.exists(local_dir):
    os.makedirs(local_dir, exist_ok=True)


def download_file(remote_path, local_path):
  """Download only if file does NOT exist locally."""
  if os.path.exists(local_path):
    return False  # Already exists

  sftp.get(remote_path, local_path)
  return True


def get_remote_files(remote_folder):
  """Get list of all remote files (recursive)."""
  file_list = []

  def walk(folder):
    for entry in sftp.listdir_attr(folder):
      path = folder + "/" + entry.filename
      if stat.S_ISDIR(entry.st_mode):
        walk(path)
      else:
        file_list.append(path)

  walk(remote_folder)
  return file_list


# ---------------------------------------------------------
# BEGIN SYNC
# ---------------------------------------------------------

remote_files = get_remote_files(REMOTE_FOLDER)
downloaded_count = 0
remote_files_set = set()

for remote_path in remote_files:
  relative = os.path.relpath(remote_path, REMOTE_FOLDER).lstrip("/")
  local_path = os.path.join(LOCAL_FOLDER, relative)

  local_dir = os.path.dirname(local_path)
  ensure_local_dir(local_dir)

  if download_file(remote_path, local_path):
    print(f"Downloaded: {relative}")
    downloaded_count += 1

  remote_files_set.add(local_path.replace("\\", "/"))

print(f"Downloaded {downloaded_count} new files.")


# Delete local files that do not exist remotely
deleted_count = 0
for root, dirs, files in os.walk(LOCAL_FOLDER):
  for f in files:
    local_path = os.path.join(root, f)
    normalized = local_path.replace("\\", "/")
    if normalized not in remote_files_set:
      os.remove(local_path)
      print(f"Deleted local file: {local_path}")
      deleted_count += 1

print(f"Deleted {deleted_count} local files not present on server.")

sftp.close()
ssh.close()

print("Reverse sync complete!")
