module View exposing (view)

import Array
import Html exposing (..)
import Html.Attributes exposing (..)


--

import Model exposing (..)
import User exposing (..)
import Header
import Flash
import MyTickets
import RemainingTickets


view : Model -> Html Msg
view model =
    div [ class "container" ]
        [ Header.view model
        , div [ class "row" ]
            [ Flash.view model
            , RemainingTickets.view model.tickets model.myUserId (myTurn model)
            , MyTickets.view model
            ]
        ]


myTurn : Model -> Bool
myTurn model =
    let
        currentUserName =
            Array.get model.currentUser model.users
                |> Maybe.withDefault nullUser
                |> .name
    in
        currentUserName == model.myUserName
