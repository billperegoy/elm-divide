module Model exposing (..)

import Array
import Http
import Json.Encode
import Phoenix.Socket
import Time


--

import Constants
import FlashElement
import User exposing (..)
import Ticket exposing (..)


type alias Model =
    { tickets : List Ticket
    , flashElements : List FlashElement.FlashElement
    , nextId : Int
    , users : Array.Array User
    , currentUser : Int
    , myUserId : Int
    , myUserName : String
    , systemError : String
    , userInputField : String
    , phxSocket : Phoenix.Socket.Socket Msg
    }


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


init : Model
init =
    { tickets = []
    , flashElements = []
    , nextId = 0
    , users = Array.fromList []
    , currentUser = 0
    , myUserId = -1
    , myUserName = ""
    , systemError = ""
    , userInputField = ""
    , phxSocket = initPhoenixSocket
    }


initPhoenixSocket : Phoenix.Socket.Socket Msg
initPhoenixSocket =
    Phoenix.Socket.init (Constants.wsBase ++ "/socket/websocket")
        |> Phoenix.Socket.withDebug
        |> Phoenix.Socket.on Constants.selectTicketEvent Constants.phoenixTopic ReceiveMessage
