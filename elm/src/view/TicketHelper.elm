module View.TicketHelper exposing (ticketList)

import Html exposing (..)
import Html.Attributes exposing (..)
import Ticket exposing (..)
import Model exposing (..)
import Utils


ticketList : Int -> Bool -> List Ticket -> List (Html Msg)
ticketList myUserId myTurn tickets =
    List.map
        (\ticket -> singleTicket ticket myUserId myTurn)
        tickets


singleTicket : Ticket -> Int -> Bool -> Html Msg
singleTicket ticket myUserId myTurn =
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
            a [ Utils.onClickNoDefault (SendMessage ticket.id myUserId), href "#" ]
                [ innerDiv
                ]
        else
            innerDiv
