module FlashElement exposing (FlashElement)

import Time


type alias FlashElement =
    { id : Int
    , text : String
    , color : String
    , duration : Time.Time
    }
