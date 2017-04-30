module UserDecoder exposing (get, post)

import Http
import Json.Decode
import Json.Encode
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


url : String
url =
    Constants.urlBase ++ "/api/v1/users"


get : Cmd Msg
get =
    Http.send ProcessUserGet (Http.get url listDecoder)


post : String -> Cmd Msg
post name =
    let
        payload =
            Json.Encode.object
                [ ( "name", Json.Encode.string name )
                , ( "role", Json.Encode.string "user" )
                ]

        body =
            Http.stringBody "application/json" (Json.Encode.encode 0 payload)
    in
        Http.send ProcessUserPost (Http.post url body decoder)
