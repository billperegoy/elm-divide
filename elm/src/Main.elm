module Main exposing (..)

import Html
import Model exposing (..)
import Subscriptions
import Update
import View
import TicketDecoder
import UserDecoder
import GroupDecoder
import Utils


main : Program Never Model Msg
main =
    Html.program
        { init =
            Model.init
                ! [ TicketDecoder.get
                  , UserDecoder.get
                  , GroupDecoder.get
                  , Utils.joinChannel
                  ]
        , view = View.view
        , update = Update.update
        , subscriptions = Subscriptions.subscriptions
        }
