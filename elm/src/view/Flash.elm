module View.Flash exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Model exposing (..)
import FlashElement
import Utils


view : Model -> Html Msg
view model =
    div [ class "col-md-2" ]
        ((userPlusButton model)
            ++ (flashViewElements model.flashElements)
        )


flashViewElements : List FlashElement.FlashElement -> List (Html Msg)
flashViewElements elements =
    List.map
        (\elem ->
            div
                [ class ("alert alert-" ++ elem.color) ]
                [ text elem.text ]
        )
        elements


userPlusButton : Model -> List (Html Msg)
userPlusButton model =
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
        , button [ Utils.onClickNoDefault SubmitUserInputField ] [ text "Login" ]
        , h3 []
            [ span [ class loginClass ]
                [ text loginText ]
            ]
        , h3 []
            [ span [ class "label label-default" ]
                [ text
                    ("Up Now: " ++ (Utils.userField model model.currentUser .name))
                ]
            ]
        , button [ class "btn btn-default", Utils.onClickNoDefault NextUser ] [ text "Next User" ]
        ]
