defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Repo
  alias Dividasaurus.Ticket
  alias Dividasaurus.Group

  def join("dividasaurus:tickets", _payload, socket) do
    {:ok, socket}
  end

  def handle_in("ticket_select", %{"user_id" => user_id, "ticket_id" => ticket_id}, socket) do
    result = Repo.get(Ticket, ticket_id)
             |> Dividasaurus.Ticket.changeset(%{"user_id" => user_id})
             |> Repo.update

     case result do
       {:ok, _} ->
         # Return the updated ticket to all clients
         ticket = Repo.get(Ticket, ticket_id)
                    |> Map.drop([:user])
         broadcast! socket, "ticket_select", ticket 

         # Return the updated active user to all clients
         groups = Repo.all(Group)
         broadcast! socket, "active_user", %{id: 20}
       {:error, result} ->
         IO.puts "Update failed: #{inspect result.errors}"
     end

    {:noreply, socket}
  end

  defp update_active_user(group_name) do
    active_user = Repo.get_by(Group, group_name)
             |> Map.fetch(:active_user)
    case active_user do
      {:ok, user_id} ->
        users = Repo.all(User)
    end
  end
end
