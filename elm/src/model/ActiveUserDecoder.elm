module ActiveUserDecoder exposing (decoder, nullActiveUser)

import Json.Decode
import Json.Decode.Pipeline


--


type alias ActiveUser =
    { id : Int
    }


nullActiveUser : ActiveUser
nullActiveUser =
    { id = -1 }


decoder : Json.Decode.Decoder ActiveUser
decoder =
    Json.Decode.Pipeline.decode ActiveUser
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
