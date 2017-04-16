module Model exposing (..)

import Time
import Phoenix.Socket
import Array


type alias Model msg =
    { tickets : List Ticket
    , flashElements : List FlashElement
    , nextId : Int
    , users : Array.Array User
    , currentUser : Int
    , myUserId : Int
    , myUserName : String
    , systemError : String
    , userInputField : String
    , phxSocket : Phoenix.Socket.Socket msg
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
