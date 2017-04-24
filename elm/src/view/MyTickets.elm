module View.MyTickets exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import View.TicketHelper exposing (..)
import Model exposing (..)


view : Model -> Html Msg
view model =
    let
        myTickets =
            List.filter
                (\ticket -> ticket.userId == Just model.myUserId)
                model.tickets

        ticketCount =
            List.length myTickets
    in
        div [ class "col-md-4" ]
            [ h1 [ style [ ( "padding-bottom", "10px" ) ] ]
                [ span
                    [ class "label label-primary" ]
                    [ text ("My Tickets - " ++ toString ticketCount) ]
                ]
            , div []
                (myTickets
                    |> ticketList model.groupName model.myUserId False
                )
            ]
