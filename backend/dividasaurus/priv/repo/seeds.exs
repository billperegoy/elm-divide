#
#     mix run priv/repo/seeds.exs

alias Dividasaurus.Repo
alias Dividasaurus.User
alias Dividasaurus.Ticket

Repo.delete_all(User)
Repo.delete_all(Ticket)

Repo.insert! %User{ name: "Bill", role: "User" }
Repo.insert! %User{ name: "Joe", role: "User" }

Repo.insert! %Ticket{ date: "April 3", opponent: "Pittsburgh", time: "2:05pm" }
Repo.insert! %Ticket{ date: "April 5", opponent: "Pittsburgh", time: "7:10pm" }
Repo.insert! %Ticket{ date: "April 6", opponent: "Pittsburgh", time: "1:35pm" }
Repo.insert! %Ticket{ date: "April 11", opponent: "Baltimore", time: "7:10pm" }
Repo.insert! %Ticket{ date: "April 12", opponent: "Baltimore", time: "7:10pm" }
