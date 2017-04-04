defmodule Dividasaurus.Ticket do
  use Dividasaurus.Web, :model
  schema "tickets" do
    field :date, :string
    field :opponent, :string
    field :time, :string
    timestamps

    belongs_to :user, Dividasaurus.User
  end

  def changeset(model, params \\ :empty) do
    model
      |> cast(params, [:user_id])
      |> foreign_key_constraint(:user_id)
  end
end
