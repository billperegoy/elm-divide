defmodule Dividasaurus.Repo.Migrations.CreateUser do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :name, :string
      add :role, :string
      timestamps
    end
    create unique_index(:users, [:name])
  end
end
