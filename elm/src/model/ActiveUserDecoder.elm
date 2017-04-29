module ActiveUserDecoder
    exposing
        ( decoder
        , fromEncodeValue
        , nullActiveUser
        )

import Json.Decode
import Json.Encode
import Json.Decode.Pipeline


--


type alias ActiveUser =
    { id : Int
    }


nullActiveUser : ActiveUser
nullActiveUser =
    { id = -1 }


fromEncodeValue : Json.Encode.Value -> ActiveUser
fromEncodeValue value =
    Json.Encode.encode 0 value
        |> Json.Decode.decodeString decoder
        |> Result.withDefault nullActiveUser


decoder : Json.Decode.Decoder ActiveUser
decoder =
    Json.Decode.Pipeline.decode ActiveUser
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
