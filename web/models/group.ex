defmodule Dividasaurus.Group do
  use Dividasaurus.Web, :model
  schema "groups" do
    field :name, :string
    field :active_user, :integer
    timestamps

    has_many :users, Dividasaurus.User
  end

  def changeset(model, params \\ :empty) do
    model
      |> cast(params, [:active_user])
  end
end
