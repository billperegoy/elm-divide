module Model exposing (..)

import Http
import Json.Encode
import Phoenix.Socket
import Time


--

import Constants
import FlashElement
import User exposing (..)
import Ticket exposing (..)
import Group exposing (..)


type alias Model =
    { groupName : String
    , tickets : List Ticket
    , flashElements : List FlashElement.FlashElement
    , nextId : Int
    , users : List User
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
    | UpdateUserInputField String
    | CreateUser
    | LoginUser
    | ProcessTicketRequest (Result Http.Error (List Ticket))
    | ProcessUserGet (Result Http.Error (List User))
    | ProcessUserPost (Result Http.Error User)
    | ProcessGroupRequest (Result Http.Error (List Group))
    | PhoenixMsg (Phoenix.Socket.Msg Msg)
    | JoinChannel
    | SendMessage Int Int String
    | ReceiveTicketMessage Json.Encode.Value
    | ReceiveActiveUserMessage Json.Encode.Value


init : Model
init =
    { groupName = "My Group"
    , tickets = []
    , flashElements = []
    , nextId = 0
    , users = []
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
        |> Phoenix.Socket.on
            Constants.selectTicketEvent
            Constants.phoenixTopic
            ReceiveTicketMessage
        |> Phoenix.Socket.on
            Constants.activeUserEvent
            Constants.phoenixTopic
            ReceiveActiveUserMessage
