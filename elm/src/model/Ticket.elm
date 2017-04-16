module Ticket exposing (Ticket, nullTicket)


type alias Ticket =
    { id : Int
    , date : String
    , opponent : String
    , time : String
    , userId : Maybe Int
    }


nullTicket : Ticket
nullTicket =
    { id = -1
    , date = "no date"
    , opponent = "no opponent"
    , time = "no time"
    , userId = Nothing
    }
