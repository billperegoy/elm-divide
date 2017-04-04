defmodule Dividasaurus.TicketController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    tickets = Repo.all(Dividasaurus.Ticket)
    json conn, tickets
  end

def update(conn, %{"id" => id} = params) do
    ticket = Repo.get(Dividasaurus.Ticket, id)
    if ticket do
      changeset = Dividasaurus.Ticket.changeset(ticket, params)
      case Repo.update(changeset) do
        {:ok, ticket} ->
          json conn |> put_status(:ok), ticket
        {:error, result} ->
          json conn |> put_status(:bad_request), 
            %{errors: ["bad update"] }
      end
    else
      json conn |> put_status(:not_found),
                   %{errors: ["invalid ticket"] }
    end
  end
end
