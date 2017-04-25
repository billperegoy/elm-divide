module View exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


--

import Model exposing (..)
import View.Header as Header
import View.Login as Login
import View.Flash as Flash
import View.MyTickets as MyTickets
import View.RemainingTickets as RemainingTickets


view : Model -> Html Msg
view model =
    div [ class "container" ]
        [ Header.view model
        , div [ class "row" ]
            [ div [ class "col-md-2" ]
                [ Login.view model
                , Flash.view model
                ]
            , RemainingTickets.view model
            , MyTickets.view model
            ]
        ]
