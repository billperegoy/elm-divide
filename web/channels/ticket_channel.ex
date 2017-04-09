defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Repo
  alias Dividasaurus.Ticket

  def join("dividasaurus:tickets", _payload, socket) do
    {:ok, socket}
  end

  def handle_in("new:msg", %{"user_id" => user_id, "ticket_id" => ticket_id}, socket) do
    result = Repo.get(Ticket, ticket_id)
             |> Dividasaurus.Ticket.changeset(%{"user_id" => user_id})
             |> Repo.update

     case result do
       {:ok, _} ->
         ticket = Repo.get(Ticket, ticket_id)
         broadcast! socket, "new:msg", ticket 
       {:error, result} ->
         IO.puts "Update failed: #{inspect result.errors}"
     end

    {:noreply, socket}
  end
end