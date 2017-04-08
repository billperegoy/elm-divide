defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Repo
  alias Dividasaurus.Ticket

  def join("dividasaurus:tickets", _payload, socket) do
    {:ok, socket}
  end

  def handle_in("new:msg", %{"user_id" => user_id, "ticket_id" => ticket_id}, socket) do
    ticket = Repo.get(Ticket, ticket_id)
    result = Dividasaurus.Ticket.changeset(ticket, %{"user_id" => user_id})
             |> Repo.update

     case  result do
       {:ok, _} ->
         IO.puts "Update sucessful"
       {:error, result} ->
         IO.puts "Update failed: #{inspect result.errors}"
     end

    broadcast! socket, "new:msg", ticket 
    {:noreply, socket}
  end
end
