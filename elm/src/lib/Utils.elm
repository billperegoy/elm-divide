module Utils exposing (..)

import Html exposing (..)
import Html.Events exposing (..)
import Json.Decode
import Model exposing (..)
import User exposing (..)
import Task


currentUserName : Model -> String
currentUserName model =
    model.users
        |> List.filter (\user -> user.id == model.currentUser)
        |> List.head
        |> Maybe.withDefault nullUser
        |> .name


joinChannel : Cmd Msg
joinChannel =
    Task.succeed JoinChannel |> Task.perform identity


onClickNoDefault : msg -> Html.Attribute msg
onClickNoDefault message =
    let
        config =
            { stopPropagation = True
            , preventDefault = True
            }
    in
        onWithOptions "click" config (Json.Decode.succeed message)
