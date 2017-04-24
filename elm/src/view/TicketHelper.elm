module View.TicketHelper exposing (ticketList)

import Html exposing (..)
import Html.Attributes exposing (..)
import Ticket exposing (..)
import Model exposing (..)
import Utils


ticketList : String -> Int -> Bool -> List Ticket -> List (Html Msg)
ticketList groupName myUserId myTurn tickets =
    List.map
        (\ticket -> singleTicket groupName ticket myUserId myTurn)
        tickets


singleTicket : String -> Ticket -> Int -> Bool -> Html Msg
singleTicket groupName ticket myUserId myTurn =
    let
        innerDiv =
            div [ class "panel panel-default" ]
                [ div [ class "panel-body" ]
                    [ div [] [ text ticket.date ]
                    , div [] [ text ticket.opponent ]
                    , div [] [ text ticket.time ]
                    ]
                ]
    in
        if myTurn then
            a [ Utils.onClickNoDefault (SendMessage ticket.id myUserId groupName), href "#" ]
                [ innerDiv
                ]
        else
            innerDiv
