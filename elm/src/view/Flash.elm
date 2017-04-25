module View.Flash exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Model exposing (..)
import FlashElement


view : Model -> Html Msg
view model =
    div []
        ((flashViewElements model.flashElements))


flashViewElements : List FlashElement.FlashElement -> List (Html Msg)
flashViewElements elements =
    List.map
        (\elem ->
            div
                [ class ("alert alert-" ++ elem.color) ]
                [ text elem.text ]
        )
        elements
