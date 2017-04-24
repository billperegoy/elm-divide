module View.RemainingTickets exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Ticket exposing (..)
import Model exposing (..)
import View.TicketHelper exposing (..)


view : List Ticket -> String -> Int -> Bool -> Html Msg
view tickets groupName myUserId myTurn =
    let
        remainingTickets =
            (List.filter
                (\ticket -> ticket.userId == Nothing)
                tickets
            )

        remainingCount =
            List.length remainingTickets
    in
        div
            [ class "col-md-4" ]
            [ h1 [ style [ ( "padding-bottom", "10px" ) ] ]
                [ span
                    [ class "label label-primary" ]
                    [ text ("Remaining Tickets - " ++ toString remainingCount) ]
                ]
            , div []
                (remainingTickets
                    |> ticketList groupName myUserId myTurn
                )
            ]
