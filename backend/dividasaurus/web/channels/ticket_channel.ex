defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Ticket

  def join("dividasaurus:tickets", _payload, socket) do
    {:ok, socket}
  end
end
