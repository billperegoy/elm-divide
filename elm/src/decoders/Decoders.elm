module Decoders exposing (..)

import Constants
import Model exposing (..)
import Http
import Json.Decode
import Json.Decode.Pipeline


ticketsRequest : Cmd Msg
ticketsRequest =
    let
        url =
            Constants.urlBase ++ "/api/v1/tickets"
    in
        Http.send ProcessTicketRequest (Http.get url ticketListDecoder)


ticketListDecoder : Json.Decode.Decoder (List Ticket)
ticketListDecoder =
    Json.Decode.list ticketDecoder


ticketDecoder : Json.Decode.Decoder Ticket
ticketDecoder =
    Json.Decode.Pipeline.decode Ticket
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "date" Json.Decode.string
        |> Json.Decode.Pipeline.required "opponent" Json.Decode.string
        |> Json.Decode.Pipeline.required "time" Json.Decode.string
        |> Json.Decode.Pipeline.required "user_id" (Json.Decode.nullable Json.Decode.int)


userListDecoder : Json.Decode.Decoder (List User)
userListDecoder =
    Json.Decode.list userDecoder


userDecoder : Json.Decode.Decoder User
userDecoder =
    Json.Decode.Pipeline.decode User
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "name" Json.Decode.string


usersRequest : Cmd Msg
usersRequest =
    let
        url =
            Constants.urlBase ++ "/api/v1/users"
    in
        Http.send ProcessUserRequest (Http.get url userListDecoder)
