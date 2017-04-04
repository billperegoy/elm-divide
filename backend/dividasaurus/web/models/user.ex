defmodule Dividasaurus.User do
  use Dividasaurus.Web, :model
  schema "users" do
    field :name, :string
    field :role, :string
    timestamps

    has_many :tickets, Dividasaurus.Ticket
  end
end
