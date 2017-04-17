module TicketDecoder exposing (httpRequest, decoder)

import Http
import Json.Decode
import Json.Decode.Pipeline


--

import Constants
import Model exposing (..)
import Ticket exposing (..)


httpRequest : Cmd Msg
httpRequest =
    let
        url =
            Constants.urlBase ++ "/api/v1/tickets"
    in
        Http.send ProcessTicketRequest (Http.get url listDecoder)


listDecoder : Json.Decode.Decoder (List Ticket)
listDecoder =
    Json.Decode.list decoder


decoder : Json.Decode.Decoder Ticket
decoder =
    Json.Decode.Pipeline.decode Ticket
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "date" Json.Decode.string
        |> Json.Decode.Pipeline.required "opponent" Json.Decode.string
        |> Json.Decode.Pipeline.required "time" Json.Decode.string
        |> Json.Decode.Pipeline.required "user_id" (Json.Decode.nullable Json.Decode.int)
