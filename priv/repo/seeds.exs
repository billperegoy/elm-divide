#
#     mix run priv/repo/seeds.exs

alias Dividasaurus.Repo
alias Dividasaurus.Group
alias Dividasaurus.User
alias Dividasaurus.Ticket


Repo.delete_all(Ticket)
Repo.delete_all(User)
Repo.delete_all(Group)

group = Repo.insert! %Group{ name: "My Group", active_user: nil }

first_user = Repo.insert! %User{ name: "Bill", role: "User", group_id: group.id }
Repo.insert! %User{ name: "Joe", role: "User", group_id: group.id }
Repo.insert! %User{ name: "John", role: "User", group_id: group.id }
Repo.insert! %User{ name: "Kelly", role: "User", group_id: nil }
Repo.insert! %User{ name: "Dave", role: "User", group_id: nil }

group = Repo.get_by(Group, name: "My Group")
group
  |> Dividasaurus.Group.changeset(%{"active_user" => first_user.id})
  |> Repo.update

Repo.insert %Ticket{ date: "04/08/17", opponent: "@Tigers", time: "01:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/09/17", opponent: "@Tigers", time: "01:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/10/17", opponent: "@Tigers", time: "01:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/11/17", opponent: "Orioles", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/12/17", opponent: "Orioles", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/13/17", opponent: "Pirates", time: "02:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/14/17", opponent: "Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/15/17", opponent: "Rays", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/16/17", opponent: "Rays", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/17/17", opponent: "Rays", time: "11:05 AM", user_id: nil }
Repo.insert %Ticket{ date: "04/18/17", opponent: "@Blue Jays", time: "07:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/19/17", opponent: "@Blue Jays", time: "07:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/20/17", opponent: "@Blue Jays", time: "12:37 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/21/17", opponent: "@Orioles", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/22/17", opponent: "@Orioles", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/23/17", opponent: "@Orioles", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/25/17", opponent: "Yankees", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/26/17", opponent: "Yankees", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/27/17", opponent: "Yankees", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/28/17", opponent: "Cubs", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/29/17", opponent: "Cubs", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "04/30/17", opponent: "Cubs", time: "08:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/01/17", opponent: "Orioles", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/02/17", opponent: "Orioles", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/03/17", opponent: "Orioles", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/04/17", opponent: "Orioles", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/05/17", opponent: "@Twins", time: "08:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/06/17", opponent: "@Twins", time: "02:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/07/17", opponent: "@Twins", time: "02:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/09/17", opponent: "@Brewers", time: "07:40 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/10/17", opponent: "@Brewers", time: "08:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/11/17", opponent: "@Brewers", time: "01:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/12/17", opponent: "Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/13/17", opponent: "Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/14/17", opponent: "Rays", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/16/17", opponent: "@Cardinals", time: "08:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/17/17", opponent: "@Cardinals", time: "08:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/18/17", opponent: "@Athletics", time: "10:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/19/17", opponent: "@Athletics", time: "09:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/20/17", opponent: "@Athletics", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/21/17", opponent: "@Athletics", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/23/17", opponent: "Rangers", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/24/17", opponent: "Rangers", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/25/17", opponent: "Rangers", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/26/17", opponent: "Mariners", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/27/17", opponent: "Mariners", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/28/17", opponent: "Mariners", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/29/17", opponent: "@White Sox", time: "02:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/30/17", opponent: "@White Sox", time: "08:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "05/31/17", opponent: "@White Sox", time: "08:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/01/17", opponent: "@Orioles", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/02/17", opponent: "@Orioles", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/03/17", opponent: "@Orioles", time: "07:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/04/17", opponent: "@Orioles", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/06/17", opponent: "@Yankees", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/07/17", opponent: "@Yankees", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/08/17", opponent: "@Yankees", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/09/17", opponent: "Tigers", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/10/17", opponent: "Tigers", time: "07:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/11/17", opponent: "Tigers - Time TBD", time: "", user_id: nil }
Repo.insert %Ticket{ date: "06/12/17", opponent: "Phillies", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/13/17", opponent: "Phillies", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/14/17", opponent: "@Phillies", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/15/17", opponent: "@Phillies", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/16/17", opponent: "@Astros", time: "08:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/17/17", opponent: "@Astros", time: "08:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/18/17", opponent: "@Astros", time: "02:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/19/17", opponent: "@Royals", time: "08:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/20/17", opponent: "@Royals", time: "08:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/21/17", opponent: "@Royals", time: "02:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/23/17", opponent: "Angels", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/24/17", opponent: "Angels", time: "07:15 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/25/17", opponent: "Angels", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/26/17", opponent: "Twins", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/27/17", opponent: "Twins", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/28/17", opponent: "Twins", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/29/17", opponent: "Twins", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "06/30/17", opponent: "@Blue Jays", time: "07:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/01/17", opponent: "@Blue Jays", time: "01:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/02/17", opponent: "@Blue Jays", time: "01:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/03/17", opponent: "@Rangers", time: "08:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/04/17", opponent: "@Rangers", time: "08:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/05/17", opponent: "@Rangers", time: "08:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/06/17", opponent: "@Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/07/17", opponent: "@Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/08/17", opponent: "@Rays", time: "04:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/09/17", opponent: "@Rays", time: "01:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/11/17", opponent: "AL All-Stars at NL All-Stars", time: "08:00 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/14/17", opponent: "Yankees", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/15/17", opponent: "Yankees", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/16/17", opponent: "Yankees", time: "08:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/17/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/18/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/19/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/20/17", opponent: "Blue Jays", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/21/17", opponent: "@Angels", time: "10:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/22/17", opponent: "@Angels", time: "09:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/23/17", opponent: "@Angels", time: "03:37 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/24/17", opponent: "@Mariners", time: "10:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/25/17", opponent: "@Mariners", time: "10:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/26/17", opponent: "@Mariners", time: "03:40 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/28/17", opponent: "Royals", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/29/17", opponent: "Royals", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "07/30/17", opponent: "Royals - Time TBD", time: "", user_id: nil }
Repo.insert %Ticket{ date: "07/31/17", opponent: "Indians", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/01/17", opponent: "Indians", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/02/17", opponent: "Indians", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/03/17", opponent: "White Sox", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/04/17", opponent: "White Sox", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/05/17", opponent: "White Sox", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/06/17", opponent: "White Sox", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/08/17", opponent: "@Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/09/17", opponent: "@Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/11/17", opponent: "@Yankees", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/12/17", opponent: "@Yankees", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/13/17", opponent: "@Yankees", time: "01:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/15/17", opponent: "Cardinals", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/16/17", opponent: "Cardinals", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/18/17", opponent: "Yankees", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/19/17", opponent: "Yankees", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/20/17", opponent: "Yankees", time: "01:30 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/21/17", opponent: "@Indians", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/22/17", opponent: "@Indians", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/23/17", opponent: "@Indians", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/24/17", opponent: "@Indians", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/25/17", opponent: "Orioles", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/26/17", opponent: "Orioles", time: "04:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/27/17", opponent: "Orioles", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/28/17", opponent: "@Blue Jays", time: "07:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/29/17", opponent: "@Blue Jays", time: "07:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/30/17", opponent: "@Blue Jays", time: "07:07 PM", user_id: nil }
Repo.insert %Ticket{ date: "08/31/17", opponent: "@Yankees", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/01/17", opponent: "@Yankees", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/02/17", opponent: "@Yankees", time: "01:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/03/17", opponent: "@Yankees", time: "01:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/04/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/05/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/06/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/08/17", opponent: "Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/09/17", opponent: "Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/10/17", opponent: "Rays", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/12/17", opponent: "Athletics", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/13/17", opponent: "Athletics", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/14/17", opponent: "Athletics", time: "01:35 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/15/17", opponent: "@Rays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/16/17", opponent: "@Rays", time: "06:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/17/17", opponent: "@Rays", time: "01:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/18/17", opponent: "@Orioles", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/19/17", opponent: "@Orioles", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/20/17", opponent: "@Orioles", time: "07:05 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/22/17", opponent: "@Reds", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/23/17", opponent: "@Reds", time: "04:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/24/17", opponent: "@Reds", time: "01:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/25/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/26/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/27/17", opponent: "Blue Jays", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/28/17", opponent: "Astros", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/29/17", opponent: "Astros", time: "07:10 PM", user_id: nil }
Repo.insert %Ticket{ date: "09/30/17", opponent: "Astros", time: "TBD", user_id: nil }
Repo.insert %Ticket{ date: "10/01/17", opponent: "Astros", time: "03:05 PM", user_id: nil }
