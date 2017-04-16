module Update exposing (..)

import Model exposing (..)
import Array
import Task
import Time
import Phoenix.Socket
import Phoenix.Channel
import Phoenix.Push
import Json.Encode
import Json.Decode
import Json.Decode.Pipeline
import Result
import Process
import Utils


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NextUser ->
            let
                length =
                    Array.length model.users

                nextUser =
                    if model.currentUser == (length - 1) then
                        0
                    else
                        model.currentUser + 1

                nextUserName =
                    Utils.userField model nextUser .name

                color =
                    if nextUserName == model.myUserName then
                        "danger"
                    else
                        "info"
            in
                { model | currentUser = nextUser }
                    ! [ createFlashElement
                            (nextUserName ++ "'s turn")
                            color
                            20
                      ]

        UpdateUserInputField text ->
            { model | userInputField = text } ! []

        SubmitUserInputField ->
            { model
                | myUserName = model.userInputField
                , userInputField = ""
                , myUserId = userIdFromName model.userInputField (Array.toList model.users)
            }
                ! []

        CreateFlashElement text color duration ->
            let
                newFlashElement =
                    { id = model.nextId
                    , text = text
                    , color = color
                    , duration = duration
                    }

                newList =
                    newFlashElement :: model.flashElements
            in
                { model
                    | flashElements = newList
                    , nextId = model.nextId + 1
                }
                    ! [ deleteCmd
                            model.nextId
                            newFlashElement.duration
                      ]

        DeleteFlashElement id time ->
            let
                newList =
                    List.filter
                        (\elem -> elem.id /= id)
                        model.flashElements
            in
                { model | flashElements = newList } ! []

        ProcessTicketRequest (Ok tickets) ->
            { model | tickets = tickets } ! []

        ProcessTicketRequest (Err error) ->
            let
                errorString =
                    error |> toString |> String.slice 0 120
            in
                { model | systemError = errorString } ! []

        ProcessUserRequest (Ok users) ->
            { model
                | users = Array.fromList users
            }
                ! []

        ProcessUserRequest (Err error) ->
            let
                errorString =
                    error |> toString |> String.slice 0 120
            in
                { model | systemError = errorString } ! []

        PhoenixMsg msg ->
            let
                ( phxSocket, phxCmd ) =
                    Phoenix.Socket.update msg model.phxSocket
            in
                ( { model | phxSocket = phxSocket }
                , Cmd.map PhoenixMsg phxCmd
                )

        JoinChannel ->
            let
                channel =
                    Phoenix.Channel.init "dividasaurus:tickets"

                ( phxSocket, phxCmd ) =
                    Phoenix.Socket.join channel model.phxSocket
            in
                ( { model | phxSocket = phxSocket }
                , Cmd.map PhoenixMsg phxCmd
                )

        SendMessage ticketId userId ->
            let
                payload =
                    (Json.Encode.object
                        [ ( "user_id", Json.Encode.int userId )
                        , ( "ticket_id", Json.Encode.int ticketId )
                        ]
                    )

                push_ =
                    Phoenix.Push.init "ticket_select" "dividasaurus:tickets"
                        |> Phoenix.Push.withPayload payload

                ( phxSocket, phxCmd ) =
                    Phoenix.Socket.push push_ model.phxSocket
            in
                { model | phxSocket = phxSocket }
                    ! [ Cmd.map PhoenixMsg phxCmd ]

        ReceiveMessage message ->
            let
                updatedTicket =
                    Json.Encode.encode 0 message
                        |> Json.Decode.decodeString ticketDecoder
                        |> Result.withDefault nullTicket

                newTickets =
                    List.map
                        (\ticket ->
                            if ticket.id == updatedTicket.id then
                                updatedTicket
                            else
                                ticket
                        )
                        model.tickets

                gameDate =
                    updatedTicket.date

                gameOwner =
                    userNameFromId
                        (model.users |> Array.toList)
                        (updatedTicket.userId |> Maybe.withDefault -1)

                flashString =
                    gameOwner
                        ++ " chose "
                        ++ gameDate
                        ++ " ("
                        ++ updatedTicket.opponent
                        ++ ")"
            in
                { model | tickets = newTickets }
                    ! [ createFlashElement flashString "info" 20
                      ]


createFlashElement : String -> String -> Time.Time -> Cmd Msg
createFlashElement message color duration =
    Task.succeed
        (CreateFlashElement
            message
            color
            duration
        )
        |> Task.perform identity


userNameFromId : List User -> Int -> String
userNameFromId users id =
    List.filter (\user -> user.id == id) users
        |> List.head
        |> Maybe.withDefault nullUser
        |> .name


userIdFromName : String -> List User -> Int
userIdFromName name users =
    List.filter (\user -> user.name == name) users
        |> List.head
        |> Maybe.withDefault nullUser
        |> .id


deleteCmd : Int -> Time.Time -> Cmd Msg
deleteCmd id duration =
    Process.sleep (duration * Time.second)
        |> Task.perform
            (\_ -> DeleteFlashElement id duration)


ticketDecoder : Json.Decode.Decoder Ticket
ticketDecoder =
    Json.Decode.Pipeline.decode Ticket
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "date" Json.Decode.string
        |> Json.Decode.Pipeline.required "opponent" Json.Decode.string
        |> Json.Decode.Pipeline.required "time" Json.Decode.string
        |> Json.Decode.Pipeline.required "user_id" (Json.Decode.nullable Json.Decode.int)
