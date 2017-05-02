module View.Sidebar exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Model exposing (..)
import View.Login as Login
import View.Flash as Flash


view : Model -> Html Msg
view model =
    div [ class "col-md-4" ]
        [ Login.view model
        , Flash.view model
        ]
