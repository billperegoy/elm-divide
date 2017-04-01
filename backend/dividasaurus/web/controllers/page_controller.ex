defmodule Dividasaurus.PageController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
