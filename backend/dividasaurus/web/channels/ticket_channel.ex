defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Ticket

  def join("dividasaurus:tickets", _payload, socket) do
    {:ok, socket}
  end

  def handle_in("new:msg", %{"body" => body}, socket) do
    # Grab icket_id and user_id from body and perform the update
    # operation. Then retuen the ticket info back using a broadcast.
    IO.puts "Received message..."
    broadcast! socket, "new:msg", %{body: body}
    {:noreply, socket}
  end
end
