defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Ticket

  def join("ticket:" <> _id, _payload, socket) do
    IO.puts "Join successful..."
    {:ok, socket}
  end
end
