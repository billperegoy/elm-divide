defimpl Poison.Encoder, for: Any do
  def encode(%{__struct__: _} = struct, options) do
    struct
      |> Map.from_struct
      |> sanitize_map
      |> remove_associations
      |> Poison.Encoder.Map.encode(options)
  end

  defp sanitize_map(map) do
    Map.drop(map, [:__meta__, :__struct__])
  end

  defp remove_associations(map) do
    Map.drop(map, [:tickets, :user, :group])
  end
end
