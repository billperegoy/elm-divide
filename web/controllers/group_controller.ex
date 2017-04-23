defmodule Dividasaurus.GroupController do
  use Dividasaurus.Web, :controller

  def index(conn, _params) do
    groups = Repo.all(Dividasaurus.Group)
             |> Enum.map(fn(group) -> cleanup(group) end)
    json conn, groups
  end

  defp cleanup(group) do
    Map.drop(group, [:users])
  end
end
