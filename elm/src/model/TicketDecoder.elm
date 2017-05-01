module TicketDecoder
    exposing
        ( get
        , decoder
        , fromEncodeValue
        )

import Http
import Json.Decode
import Json.Encode
import Json.Decode.Pipeline


--

import Constants
import Model exposing (..)
import Ticket exposing (..)


get : Cmd Msg
get =
    let
        url =
            Constants.urlBase ++ "/api/v1/tickets"
    in
        Http.send ProcessTicketGet (Http.get url listDecoder)


listDecoder : Json.Decode.Decoder (List Ticket)
listDecoder =
    Json.Decode.list decoder


fromEncodeValue : Json.Encode.Value -> Ticket
fromEncodeValue value =
    Json.Encode.encode 0 value
        |> Json.Decode.decodeString decoder
        |> Result.withDefault nullTicket


decoder : Json.Decode.Decoder Ticket
decoder =
    Json.Decode.Pipeline.decode Ticket
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "date" Json.Decode.string
        |> Json.Decode.Pipeline.required "opponent" Json.Decode.string
        |> Json.Decode.Pipeline.required "time" Json.Decode.string
        |> Json.Decode.Pipeline.required "user_id" (Json.Decode.nullable Json.Decode.int)
