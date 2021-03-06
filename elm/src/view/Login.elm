module View.Login exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Model exposing (..)
import Utils


view : Model -> Html Msg
view model =
    div []
        ((login model))


login : Model -> List (Html Msg)
login model =
    let
        loginText =
            if model.myUserName == "" then
                "Please Login"
            else
                "Logged In: " ++ model.myUserName

        loginClass =
            if model.myUserName == "" then
                "label label-danger"
            else
                "label label-default"
    in
        [ input [ onInput UpdateUserInputField ] []
        , button [ Utils.onClickNoDefault LoginUser ] [ text "Login" ]
        , button [ Utils.onClickNoDefault CreateUser ] [ text "Create User" ]
        , h3 []
            [ span [ class loginClass ]
                [ text loginText ]
            ]
        , h3 []
            [ span [ class "label label-default" ]
                [ text
                    ("Up Now: " ++ (Utils.currentUserName model))
                ]
            ]
        ]
