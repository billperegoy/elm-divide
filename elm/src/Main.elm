module Main exposing (..)

import Html
import Model exposing (..)
import Subscriptions
import Update
import View
import Ticket.Http
import User.Http
import Group.Http
import Utils


main : Program Never Model Msg
main =
    Html.program
        { init =
            Model.init
                ! [ Ticket.Http.get
                  , User.Http.get
                  , Group.Http.get
                  , Utils.joinChannel
                  ]
        , view = View.view
        , update = Update.update
        , subscriptions = Subscriptions.subscriptions
        }
