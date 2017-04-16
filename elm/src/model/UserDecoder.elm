module UserDecoder exposing (httpRequest)

import Http
import Json.Decode
import Json.Decode.Pipeline


--

import Constants
import Model exposing (..)
import User exposing (..)


listDecoder : Json.Decode.Decoder (List User)
listDecoder =
    Json.Decode.list decoder


decoder : Json.Decode.Decoder User
decoder =
    Json.Decode.Pipeline.decode User
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "name" Json.Decode.string


httpRequest : Cmd Msg
httpRequest =
    let
        url =
            Constants.urlBase ++ "/api/v1/users"
    in
        Http.send ProcessUserRequest (Http.get url listDecoder)
