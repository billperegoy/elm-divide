defmodule Dividasaurus.Ticket do
  use Dividasaurus.Web, :model
  schema "tickets" do
    field :date, :string
    field :opponent, :string
    field :time, :string
    timestamps

    #belongs_to :user, Dividasaurus.User
  end
end
