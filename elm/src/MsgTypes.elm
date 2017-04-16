module MsgTypes exposing (..)

import Json.Encode
import Phoenix.Socket
import Http
import Time
import Model exposing (..)


type Msg
    = CreateFlashElement String String Time.Time
    | DeleteFlashElement Int Time.Time
    | NextUser
    | UpdateUserInputField String
    | SubmitUserInputField
    | ProcessTicketRequest (Result Http.Error (List Ticket))
    | ProcessUserRequest (Result Http.Error (List User))
    | PhoenixMsg (Phoenix.Socket.Msg Msg)
    | JoinChannel
    | SendMessage Int Int
    | ReceiveMessage Json.Encode.Value
