module View.Header exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Model exposing (..)


view : Model -> Html Msg
view model =
    let
        errorAttributes =
            if model.systemError == "" then
                []
            else
                [ class "alert alert-danger" ]
    in
        div []
            [ div [ class "jumbotron text-center" ] [ h1 [] [ text "Dividasaurus" ] ]
            , div errorAttributes [ text model.systemError ]
            ]
