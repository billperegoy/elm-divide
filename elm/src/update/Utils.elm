module Update.Utils exposing (..)

import Array
import Json.Encode
import Json.Decode
import Phoenix.Channel
import Phoenix.Push
import Phoenix.Socket
import Process
import Result
import Task
import Time
import Http


--

import Model exposing (..)
import Ticket exposing (..)
import User exposing (..)
import TicketDecoder
import Utils


nextUser : Model -> ( Model, Cmd Msg )
nextUser model =
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


updateUserInputField : Model -> String -> ( Model, Cmd Msg )
updateUserInputField model text =
    { model | userInputField = text } ! []


submitUserInputField : Model -> ( Model, Cmd Msg )
submitUserInputField model =
    { model
        | myUserName = model.userInputField
        , userInputField = ""
        , myUserId = userIdFromName model.userInputField (Array.toList model.users)
    }
        ! []


createFlashElementAction : Model -> String -> String -> Time.Time -> ( Model, Cmd Msg )
createFlashElementAction model text color duration =
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


deleteFlashElement : Model -> Int -> Time.Time -> ( Model, Cmd Msg )
deleteFlashElement model id time =
    let
        newList =
            List.filter
                (\elem -> elem.id /= id)
                model.flashElements
    in
        { model | flashElements = newList } ! []


processValidTicketRequest : Model -> List Ticket -> ( Model, Cmd Msg )
processValidTicketRequest model tickets =
    { model | tickets = tickets } ! []


processErrorTicketRequest : Model -> Http.Error -> ( Model, Cmd Msg )
processErrorTicketRequest model error =
    let
        errorString =
            error |> toString |> String.slice 0 120
    in
        { model | systemError = errorString } ! []


processValidUserRequest : Model -> List User -> ( Model, Cmd Msg )
processValidUserRequest model users =
    { model
        | users = Array.fromList users
    }
        ! []


processErrorUserRequest : Model -> Http.Error -> ( Model, Cmd Msg )
processErrorUserRequest model error =
    let
        errorString =
            error |> toString |> String.slice 0 120
    in
        { model | systemError = errorString } ! []


phoenixMsg : Model -> Phoenix.Socket.Msg Msg -> ( Model, Cmd Msg )
phoenixMsg model msg =
    let
        ( phxSocket, phxCmd ) =
            Phoenix.Socket.update msg model.phxSocket
    in
        ( { model | phxSocket = phxSocket }
        , Cmd.map PhoenixMsg phxCmd
        )


joinChannel model =
    let
        channel =
            Phoenix.Channel.init "dividasaurus:tickets"

        ( phxSocket, phxCmd ) =
            Phoenix.Socket.join channel model.phxSocket
    in
        ( { model | phxSocket = phxSocket }
        , Cmd.map PhoenixMsg phxCmd
        )


sendMessage model ticketId userId =
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


receiveMessage model message =
    let
        updatedTicket =
            Json.Encode.encode 0 message
                |> Json.Decode.decodeString TicketDecoder.decoder
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


userNameFromId : List User -> Int -> String
userNameFromId users id =
    List.filter (\user -> user.id == id) users
        |> List.head
        |> Maybe.withDefault nullUser
        |> .name


deleteCmd : Int -> Time.Time -> Cmd Msg
deleteCmd id duration =
    Process.sleep (duration * Time.second)
        |> Task.perform
            (\_ -> DeleteFlashElement id duration)


createFlashElement : String -> String -> Time.Time -> Cmd Msg
createFlashElement message color duration =
    Task.succeed
        (CreateFlashElement
            message
            color
            duration
        )
        |> Task.perform identity


userIdFromName : String -> List User -> Int
userIdFromName name users =
    List.filter (\user -> user.name == name) users
        |> List.head
        |> Maybe.withDefault nullUser
        |> .id
