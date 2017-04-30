defmodule Dividasaurus.UserController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    users = Repo.all(Dividasaurus.User)
             |> Enum.map(fn(user) -> cleanup(user) end)
    json conn, users
  end

  def create(conn, params) do
    changeset = Dividasaurus.User.changeset( %Dividasaurus.User{}, params)
    case Repo.insert(changeset) do
      {:ok, user} ->
        json conn |> put_status(:created), user |> Map.drop([:group, :tickets]) 
      {:error, _changeset} ->
        json conn |> put_status(:bad_request), %{error: "Duplicate name"}
    end

    json conn, nil
  end

  defp cleanup(user) do
    Map.drop(user, [:tickets, :group])
  end
end
