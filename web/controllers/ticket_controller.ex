defmodule Dividasaurus.TicketController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    tickets = Repo.all(Dividasaurus.Ticket)
             |> Enum.map(fn(ticket) -> cleanup(ticket) end)
    json conn, tickets
  end

  defp cleanup(ticket) do
    Map.drop(ticket, [:user])
  end
end
