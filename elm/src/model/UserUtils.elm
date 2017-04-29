module User.Utils exposing (..)

import User exposing (..)


nameFromId : List User -> Maybe Int -> String
nameFromId users maybeId =
    let
        id =
            maybeId |> Maybe.withDefault -1
    in
        List.filter (\user -> user.id == id) users
            |> List.head
            |> Maybe.withDefault nullUser
            |> .name
