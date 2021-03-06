module Group.Http exposing (get)

import Http
import Json.Decode
import Json.Decode.Pipeline


--

import Constants
import Model exposing (..)
import Group exposing (..)


listDecoder : Json.Decode.Decoder (List Group)
listDecoder =
    Json.Decode.list decoder


decoder : Json.Decode.Decoder Group
decoder =
    Json.Decode.Pipeline.decode Group
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "name" Json.Decode.string
        |> Json.Decode.Pipeline.required "active_user" Json.Decode.int


get : Cmd Msg
get =
    let
        url =
            Constants.urlBase ++ "/api/v1/groups"
    in
        Http.send ProcessGroupGet (Http.get url listDecoder)
