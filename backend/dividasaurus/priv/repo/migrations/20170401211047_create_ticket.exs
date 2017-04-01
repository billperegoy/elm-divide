defmodule Dividasaurus.Repo.Migrations.CreateTicket do
  use Ecto.Migration

  def change do
    create table(:tickets) do
      add :date, :string
      add :opponent, :string
      add :time, :string
      timestamps
    end
  end
end
