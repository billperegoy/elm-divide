module Group exposing (Group, nullGroup)


type alias Group =
    { id : Int
    , name : String
    , activeUser : Int
    }


nullGroup : Group
nullGroup =
    { id = -1
    , name = "Null Group"
    , activeUser = -1
    }
