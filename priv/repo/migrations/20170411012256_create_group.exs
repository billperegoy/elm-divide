defmodule Dividasaurus.Repo.Migrations.CreateGroup do
  use Ecto.Migration

  def change do
    create table(:groups) do
      add :name, :string
      add :active_user, :integer
      timestamps
    end
  end
end
