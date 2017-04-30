defmodule Dividasaurus.User do
  use Dividasaurus.Web, :model
  schema "users" do
    field :name, :string
    field :role, :string
    timestamps

    has_many :tickets, Dividasaurus.Ticket
    belongs_to :group, Dividasaurus.Group
  end

  def changeset(model, params \\ :empty) do
    model
      |> cast(params, [:name, :role])
      |> Map.drop([:group])
      |> unique_constraint(:name)
  end
end
