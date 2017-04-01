defmodule Dividasaurus.Router do
  use Dividasaurus.Web, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api/v1", Dividasaurus do
    pipe_through :api
    get "/users", UserController, :index
  end
end
