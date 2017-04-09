defmodule Dividasaurus.TicketController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    tickets = Repo.all(Dividasaurus.Ticket)
    json conn, tickets
  end
end
