defmodule Dividasaurus.UserController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    users = Repo.all(Dividasaurus.User)
             |> Enum.map(fn(user) -> cleanup(user) end)
    json conn, users
  end

  defp cleanup(user) do
    Map.drop(user, [:tickets, :group])
  end
end
