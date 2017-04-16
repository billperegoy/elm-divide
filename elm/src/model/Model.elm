module Model exposing (..)

import Time
import Phoenix.Socket
import Array
import Json.Encode
import Http
import Time
import Constants


type alias Model =
    { tickets : List Ticket
    , flashElements : List FlashElement
    , nextId : Int
    , users : Array.Array User
    , currentUser : Int
    , myUserId : Int
    , myUserName : String
    , systemError : String
    , userInputField : String
    , phxSocket : Phoenix.Socket.Socket Msg
    }


type alias FlashElement =
    { id : Int
    , text : String
    , color : String
    , duration : Time.Time
    }


type alias Ticket =
    { id : Int
    , date : String
    , opponent : String
    , time : String
    , userId : Maybe Int
    }


type alias User =
    { id : Int
    , name : String
    }


nullUser : User
nullUser =
    { id = -1
    , name = "guest"
    }


nullTicket : Ticket
nullTicket =
    { id = -1
    , date = "no date"
    , opponent = "no opponent"
    , time = "no time"
    , userId = Nothing
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
        |> Phoenix.Socket.on "ticket_select" "dividasaurus:tickets" ReceiveMessage
