defmodule Dividasaurus.UserController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    users = Repo.all(Dividasaurus.User)
    json conn, users
  end
end
