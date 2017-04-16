module Subscriptions exposing (subscriptions)

import Phoenix.Socket


--

import Model exposing (..)


subscriptions : Model -> Sub Msg
subscriptions model =
    Phoenix.Socket.listen model.phxSocket PhoenixMsg
