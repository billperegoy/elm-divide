module Constants
    exposing
        ( urlBase
        , wsBase
        , phoenixTopic
        , selectTicketEvent
        , activeUserEvent
        )


useHeroku : Bool
useHeroku =
    True


hostName : String
hostName =
    if useHeroku then
        "dividasaurus.herokuapp.com"
    else
        "localhost:4000"


urlBase : String
urlBase =
    if useHeroku then
        "https://" ++ hostName
    else
        "http://" ++ hostName


wsBase : String
wsBase =
    if useHeroku then
        "wss://" ++ hostName
    else
        "ws://" ++ hostName


phoenixTopic : String
phoenixTopic =
    "dividasaurus:tickets"


selectTicketEvent : String
selectTicketEvent =
    "ticket_select"


activeUserEvent : String
activeUserEvent =
    "active_user"
