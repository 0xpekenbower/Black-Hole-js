import getpass
import bcrypt
import sys

username = sys.argv[1]
password = sys.argv[2]

hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
print("basic_auth_users:")
print(f"  {username}: {hashed_password.decode()}")

exit(0)