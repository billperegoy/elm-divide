module Update.Actions exposing (..)

import Json.Encode as Encode
import Phoenix.Channel
import Phoenix.Push
import Phoenix.Socket
import Process
import Task
import Time
import Http


--

import Model exposing (..)
import Ticket exposing (..)
import User exposing (..)
import Group exposing (..)
import TicketDecoder
import ActiveUserDecoder
import Constants
import Ticket.Utils
import User.Utils


updateUserInputField : Model -> String -> ( Model, Cmd Msg )
updateUserInputField model text =
    { model | userInputField = text } ! []


submitUserInputField : Model -> ( Model, Cmd Msg )
submitUserInputField model =
    { model
        | myUserName = model.userInputField
        , userInputField = ""
        , myUserId = userIdFromName model.userInputField model.users
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


processValidUserRequest : Model -> List User -> ( Model, Cmd Msg )
processValidUserRequest model users =
    { model
        | users = users
    }
        ! []


processValidGroupRequest : Model -> List Group -> ( Model, Cmd Msg )
processValidGroupRequest model groups =
    let
        activeUser =
            List.filter (\group -> group.name == model.groupName) groups
                |> List.head
                |> Maybe.withDefault nullGroup
                |> .activeUser
    in
        { model | currentUser = activeUser } ! []


processError : Model -> Http.Error -> ( Model, Cmd Msg )
processError model error =
    let
        errorString =
            error
                |> toString
                |> String.slice 0 120
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


joinChannel : Model -> ( Model, Cmd Msg )
joinChannel model =
    let
        channel =
            Phoenix.Channel.init Constants.phoenixTopic

        ( phxSocket, phxCmd ) =
            Phoenix.Socket.join channel model.phxSocket
    in
        ( { model | phxSocket = phxSocket }
        , Cmd.map PhoenixMsg phxCmd
        )


sendMessage : Model -> Int -> Int -> String -> ( Model, Cmd Msg )
sendMessage model ticketId userId groupName =
    let
        payload =
            (Encode.object
                [ ( "user_id", Encode.int userId )
                , ( "ticket_id", Encode.int ticketId )
                , ( "group_name", Encode.string groupName )
                ]
            )

        push_ =
            Phoenix.Push.init Constants.selectTicketEvent Constants.phoenixTopic
                |> Phoenix.Push.withPayload payload

        ( phxSocket, phxCmd ) =
            Phoenix.Socket.push push_ model.phxSocket
    in
        { model | phxSocket = phxSocket }
            ! [ Cmd.map PhoenixMsg phxCmd ]


receiveTicketMessage : Model -> Encode.Value -> ( Model, Cmd Msg )
receiveTicketMessage model message =
    let
        ticket =
            TicketDecoder.fromEncodeValue message

        newTickets =
            Ticket.Utils.update ticket model.tickets

        owner =
            User.Utils.nameFromId model.users ticket.userId

        flashString =
            Ticket.Utils.selectMessage ticket owner
    in
        { model | tickets = newTickets }
            ! [ createFlashElement flashString "info" 20
              ]


receiveActiveUserMessage : Model -> Encode.Value -> ( Model, Cmd Msg )
receiveActiveUserMessage model message =
    let
        activeUser =
            ActiveUserDecoder.fromEncodeValue message
                |> .id

        nextUserName =
            User.Utils.nameFromId model.users (Just activeUser)

        color =
            if nextUserName == model.myUserName then
                "danger"
            else
                "info"
    in
        { model | currentUser = activeUser }
            ! [ createFlashElement ("Next user is " ++ nextUserName) color 20 ]


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
