module View.RemainingTickets exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Model exposing (..)
import View.TicketHelper exposing (..)


view : Model -> Html Msg
view model =
    let
        myTurn =
            model.currentUser == model.myUserId

        remainingTickets =
            (List.filter
                (\ticket -> ticket.userId == Nothing)
                model.tickets
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
                    |> ticketList model.groupName model.myUserId myTurn
                )
            ]
