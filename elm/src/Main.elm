module Main exposing (..)

import Html
import Model exposing (..)
import Subscriptions
import Update
import View
import TicketDecoder
import UserDecoder
import Utils


main : Program Never Model Msg
main =
    Html.program
        { init =
            Model.init
                ! [ TicketDecoder.httpRequest, UserDecoder.httpRequest, Utils.joinChannel ]
        , view = View.view
        , update = Update.update
        , subscriptions = Subscriptions.subscriptions
        }
