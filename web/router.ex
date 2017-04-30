defmodule Dividasaurus.Router do
  use Dividasaurus.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Dividasaurus do
    pipe_through :browser

    get "/", PageController, :index
  end

  scope "/api/v1", Dividasaurus do
    pipe_through :api
    get "/groups", GroupController, :index
    get "/users", UserController, :index
    post "/users", UserController, :create
    get "/tickets", TicketController, :index
  end
end
