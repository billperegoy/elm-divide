defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Repo
  alias Dividasaurus.Ticket

  def join("dividasaurus:tickets", _payload, socket) do
    {:ok, socket}
  end

  def handle_in("new:msg", %{"user_id" => user_id, "ticket_id" => ticket_id}, socket) do
    # FIXME - Need to do error checking on both get and update
    # Also, do I need to do another get or does update return what I
    # want to send back
    ticket = Repo.get(Ticket, ticket_id)
    changeset = Dividasaurus.Ticket.changeset(ticket, %{"user_id" => user_id})
    Repo.update(changeset)
    ticket = Repo.get(Ticket, ticket_id)

    broadcast! socket, "new:msg", ticket 
    {:noreply, socket}
  end
end
