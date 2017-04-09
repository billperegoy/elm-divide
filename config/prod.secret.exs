use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
#
# You should document the content of this
# file or create a script for recreating it, since it's
# kept out of version control and might be hard to recover
# or recreate for your teammates (or you later on).
config :dividasaurus, Dividasaurus.Endpoint,
  secret_key_base: "txXdZqC27SimwpA2xjTYiLapodjlVyJfs1kYWL2LEkDKqdvMbatTCEVFLVV42f5E"

# Configure your database
config :dividasaurus, Dividasaurus.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "dividasaurus_prod",
  pool_size: 20
