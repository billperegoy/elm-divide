defmodule Dividasaurus.UserController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    users = []
    json conn, users
  end
end
