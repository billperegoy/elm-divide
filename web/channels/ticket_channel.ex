defmodule Dividasaurus.TicketChannel do
  use  Dividasaurus.Web, :channel
  alias Dividasaurus.Repo
  alias Dividasaurus.User
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
         new_active_user = update_active_user("My Group")
         broadcast! socket, "active_user", %{id: new_active_user}
       {:error, result} ->
         IO.puts "Update failed: #{inspect result.errors}"
     end

    {:noreply, socket}
  end

  defp get_next_active_user(group_name) do
    active_user = Repo.get_by(Group, name: group_name)
                  |> Map.get(:active_user)
    users = Repo.all(User)
    new_index = get_next_user_index(users, active_user)

    Enum.at(users, new_index)
      |> Map.get(:id)
  end

  defp get_next_user_index(users, active_user) do
    index = Enum.find_index(users, fn(user) -> Map.get(user, :id) == active_user end)
    if index < (length(users) - 1) do
      index + 1
    else
      0
    end
  end

  defp update_active_user(group_name) do
    new_active_user = get_next_active_user(group_name)
    active_user = Repo.get_by(Group, name: group_name)
                  |> Dividasaurus.Group.changeset(%{"active_user" => new_active_user})
                  |> Repo.update

    new_active_user
  end
end
