import os

import truststore
truststore.inject_into_ssl()  # local HTTPS interception breaks certifi's bundle

from dotenv import load_dotenv
from supabase import create_client

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(ROOT, ".env"))

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["Service_role"])
