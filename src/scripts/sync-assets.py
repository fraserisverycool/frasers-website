import paramiko
import os
import stat

LOCAL_FOLDER = "../assets/"
REMOTE_FOLDER = "/var/www/images"
PI_HOST = "192.168.2.153"  # Replace with your IP Address
PI_USER = "fraserbowen"  # Replace with your username
PI_PASSWORD = "BigCheeseForever1!"  # Replace with your password
PI_KEY_PATH = None

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

if PI_KEY_PATH:
  key = paramiko.RSAKey.from_private_key_file(PI_KEY_PATH)
  ssh.connect(PI_HOST, username=PI_USER, pkey=key)
else:
  ssh.connect(PI_HOST, username=PI_USER, password=PI_PASSWORD)

sftp = ssh.open_sftp()

def ensure_remote_dir(remote_dir):
  """Recursively create remote directories if they don't exist."""
  parts = remote_dir.split('/')
  current = ""
  for part in parts:
    if part:
      current += f"/{part}"
      try:
        sftp.stat(current)
      except FileNotFoundError:
        sftp.mkdir(current)


def upload_file(local_path, remote_path):
  """Upload the file only if it does NOT already exist on the server."""
  try:
    sftp.stat(remote_path)
    return False
  except FileNotFoundError:
    pass

  sftp.put(local_path, remote_path)
  return True

def get_remote_files(remote_folder):
  """Get all files on remote recursively."""
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

uploaded_count = 0
local_files_set = set()

for root, dirs, files in os.walk(LOCAL_FOLDER):
  for file in files:
    local_path = os.path.join(root, file)
    relative_path = os.path.relpath(local_path, LOCAL_FOLDER)
    remote_path = os.path.join(REMOTE_FOLDER, relative_path).replace("\\", "/")
    remote_dir = os.path.dirname(remote_path)
    ensure_remote_dir(remote_dir)

    if upload_file(local_path, remote_path):
      print(f"Uploaded: {relative_path}")
      uploaded_count += 1
    local_files_set.add(remote_path)

print(f"Uploaded {uploaded_count} new/changed files.")

remote_files = get_remote_files(REMOTE_FOLDER)
deleted_count = 0
for remote_file in remote_files:
  if remote_file not in local_files_set:
    sftp.remove(remote_file)
    print(f"Deleted remote file: {remote_file}")
    deleted_count += 1

print(f"Deleted {deleted_count} remote files not present locally.")

sftp.close()
ssh.close()
print("Sync complete!")
