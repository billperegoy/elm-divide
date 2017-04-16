module Constants exposing (urlBase, wsBase)


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
