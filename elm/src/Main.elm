module Main exposing (..)

import Html
import Model exposing (..)
import Subscriptions
import Update
import View
import Decoders
import Utils


main : Program Never Model Msg
main =
    Html.program
        { init =
            Model.init
                ! [ Decoders.ticketsRequest, Decoders.usersRequest, Utils.joinChannel ]
        , view = View.view
        , update = Update.update
        , subscriptions = Subscriptions.subscriptions
        }
