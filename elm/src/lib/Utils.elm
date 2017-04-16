module Utils exposing (..)

import Model exposing (..)
import Array
import Task


userField : Model -> Int -> (User -> a) -> a
userField model index extractor =
    Array.get index model.users
        |> Maybe.withDefault nullUser
        |> extractor


joinChannel : Cmd Msg
joinChannel =
    Task.succeed JoinChannel |> Task.perform identity
