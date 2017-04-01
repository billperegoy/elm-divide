#
#     mix run priv/repo/seeds.exs

alias Dividasaurus.Repo
alias Dividasaurus.User

Repo.insert! %User{
  name: "Bill",
  role: "User"
}

Repo.insert! %User{
  name: "Joe",
  role: "User"
}
