module User exposing (User, nullUser)


type alias User =
    { id : Int
    , name : String
    }


nullUser : User
nullUser =
    { id = -1
    , name = "guest"
    }
