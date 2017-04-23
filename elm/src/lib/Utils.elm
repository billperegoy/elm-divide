module Utils exposing (..)

import Html exposing (..)
import Html.Events exposing (..)
import Json.Decode
import Model exposing (..)
import User exposing (..)
import Array
import Task


userField : Model -> Int -> (User -> a) -> a
userField model index extractor =
    Array.get index model.users
        |> Maybe.withDefault nullUser
        |> extractor


currentUserName : Model -> String
currentUserName model =
    model.users
        |> Array.toList
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
