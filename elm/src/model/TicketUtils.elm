module Ticket.Utils exposing (update, selectMessage)

import Ticket exposing (..)


update : Ticket -> List Ticket -> List Ticket
update newTicket tickets =
    tickets
        |> List.map
            (\ticket ->
                if ticket.id == newTicket.id then
                    newTicket
                else
                    ticket
            )


selectMessage : Ticket -> String -> String
selectMessage ticket owner =
    owner
        ++ " chose "
        ++ ticket.date
        ++ " ("
        ++ ticket.opponent
        ++ ")"
