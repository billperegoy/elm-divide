module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Time exposing (..)
import Task exposing (..)
import Process exposing (..)
import Array exposing (..)
import Json.Decode
import Json.Encode
import Json.Decode.Pipeline
import Http
import Phoenix.Socket
import Phoenix.Channel
import Phoenix.Push
import MsgTypes exposing (..)
import Model exposing (..)


main : Program Never (Model Msg) Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


myTurn : Model Msg -> Bool
myTurn model =
    let
        currentUserName =
            Array.get model.currentUser model.users
                |> Maybe.withDefault nullUser
                |> .name
    in
        currentUserName == model.myUserName


init : ( Model Msg, Cmd Msg )
init =
    { tickets = []
    , flashElements = []
    , nextId = 0
    , users = Array.fromList []
    , currentUser = 0
    , myUserId = -1
    , myUserName = ""
    , systemError = ""
    , userInputField = ""
    , phxSocket = initPhoenixSocket
    }
        ! [ ticketsRequest, usersRequest, joinChannel ]


initPhoenixSocket : Phoenix.Socket.Socket Msg
initPhoenixSocket =
    Phoenix.Socket.init (wsBase ++ "/socket/websocket")
        |> Phoenix.Socket.withDebug
        |> Phoenix.Socket.on "ticket_select" "dividasaurus:tickets" ReceiveMessage


joinChannel : Cmd Msg
joinChannel =
    Task.succeed JoinChannel |> Task.perform identity



-- Update


update : Msg -> Model Msg -> ( Model Msg, Cmd Msg )
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
                    userField model nextUser .name

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


userNameFromId : List User -> Int -> String
userNameFromId users id =
    List.filter (\user -> user.id == id) users
        |> List.head
        |> Maybe.withDefault nullUser
        |> .name


createFlashElement : String -> String -> Time -> Cmd Msg
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


markTicketSelected : Ticket -> Int -> Int -> Ticket
markTicketSelected ticket id userId =
    if ticket.id == id then
        { ticket | userId = Just userId }
    else
        ticket


deleteCmd : Int -> Time -> Cmd Msg
deleteCmd id duration =
    Process.sleep (duration * Time.second)
        |> Task.perform
            (\_ -> DeleteFlashElement id duration)



-- View


durationString : Time -> String
durationString val =
    if val == 0 then
        ""
    else
        toString val


userPlusButton : Model Msg -> List (Html Msg)
userPlusButton model =
    let
        loginText =
            if model.myUserName == "" then
                "Please Login"
            else
                "Logged In: " ++ model.myUserName

        loginClass =
            if model.myUserName == "" then
                "label label-danger"
            else
                "label label-default"
    in
        [ input [ onInput UpdateUserInputField ] []
        , button [ onClickNoDefault SubmitUserInputField ] [ text "Login" ]
        , h3 []
            [ span [ class loginClass ]
                [ text loginText ]
            ]
        , h3 []
            [ span [ class "label label-default" ]
                [ text
                    ("Up Now: " ++ (userField model model.currentUser .name))
                ]
            ]
        , button [ class "btn btn-default", onClickNoDefault NextUser ] [ text "Next User" ]
        ]


flashView : Model Msg -> Html Msg
flashView model =
    div [ class "col-md-2" ]
        ((userPlusButton model)
            ++ (flashViewElements model.flashElements)
        )


flashViewElements : List FlashElement -> List (Html Msg)
flashViewElements elements =
    List.map
        (\elem ->
            div
                [ class ("alert alert-" ++ elem.color) ]
                [ text elem.text ]
        )
        elements


header : Model Msg -> Html Msg
header model =
    let
        errorAttributes =
            if model.systemError == "" then
                []
            else
                [ class "alert alert-danger" ]
    in
        div []
            [ div [ class "jumbotron text-center" ] [ h1 [] [ text "Dividasaurus" ] ]
            , div errorAttributes [ text model.systemError ]
            ]


ticketList : Int -> Bool -> List Ticket -> List (Html Msg)
ticketList myUserId myTurn tickets =
    List.map
        (\ticket -> singleTicket ticket myUserId myTurn)
        tickets


singleTicket : Ticket -> Int -> Bool -> Html Msg
singleTicket ticket myUserId myTurn =
    let
        innerDiv =
            div [ class "panel panel-default" ]
                [ div [ class "panel-body" ]
                    [ div [] [ text ticket.date ]
                    , div [] [ text ticket.opponent ]
                    , div [] [ text ticket.time ]
                    ]
                ]
    in
        if myTurn then
            a [ onClickNoDefault (SendMessage ticket.id myUserId), href "#" ]
                [ innerDiv
                ]
        else
            innerDiv


remainingTickets : List Ticket -> Int -> Bool -> Html Msg
remainingTickets tickets myUserId myTurn =
    let
        remainingTickets =
            (List.filter
                (\ticket -> ticket.userId == Nothing)
                tickets
            )

        remainingCount =
            List.length remainingTickets
    in
        div
            [ class "col-md-4" ]
            [ h1 [ style [ ( "padding-bottom", "10px" ) ] ]
                [ span
                    [ class "label label-primary" ]
                    [ text ("Remaining Tickets - " ++ toString remainingCount) ]
                ]
            , div []
                (remainingTickets
                    |> ticketList myUserId myTurn
                )
            ]


userField : Model Msg -> Int -> (User -> a) -> a
userField model index extractor =
    Array.get index model.users
        |> Maybe.withDefault nullUser
        |> extractor


myTickets : Model Msg -> Html Msg
myTickets model =
    let
        myTickets =
            List.filter
                (\ticket -> ticket.userId == Just model.myUserId)
                model.tickets

        ticketCount =
            List.length myTickets
    in
        div [ class "col-md-4" ]
            [ h1 [ style [ ( "padding-bottom", "10px" ) ] ]
                [ span
                    [ class "label label-primary" ]
                    [ text ("My Tickets - " ++ toString ticketCount) ]
                ]
            , div []
                (myTickets
                    |> ticketList model.myUserId False
                )
            ]


view : Model Msg -> Html Msg
view model =
    let
        itsMyTurn =
            myTurn model
    in
        div [ class "container" ]
            [ header model
            , div [ class "row" ]
                [ flashView model
                , remainingTickets model.tickets model.myUserId itsMyTurn
                , myTickets model
                ]
            ]



-- Decoders


ticketListDecoder : Json.Decode.Decoder (List Ticket)
ticketListDecoder =
    Json.Decode.list ticketDecoder


ticketDecoder : Json.Decode.Decoder Ticket
ticketDecoder =
    Json.Decode.Pipeline.decode Ticket
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "date" Json.Decode.string
        |> Json.Decode.Pipeline.required "opponent" Json.Decode.string
        |> Json.Decode.Pipeline.required "time" Json.Decode.string
        |> Json.Decode.Pipeline.required "user_id" (Json.Decode.nullable Json.Decode.int)


useHeroku : Bool
useHeroku =
    True


hostName : String
hostName =
    if useHeroku then
        "dividasaurus.herokuapp.com"
    else
        "localhost:4000"


urlBase : String
urlBase =
    if useHeroku then
        "https://" ++ hostName
    else
        "http://" ++ hostName


wsBase : String
wsBase =
    if useHeroku then
        "wss://" ++ hostName
    else
        "ws://" ++ hostName


ticketsRequest : Cmd Msg
ticketsRequest =
    let
        url =
            urlBase ++ "/api/v1/tickets"
    in
        Http.send ProcessTicketRequest (Http.get url ticketListDecoder)


userListDecoder : Json.Decode.Decoder (List User)
userListDecoder =
    Json.Decode.list userDecoder


userDecoder : Json.Decode.Decoder User
userDecoder =
    Json.Decode.Pipeline.decode User
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "name" Json.Decode.string


usersRequest : Cmd Msg
usersRequest =
    let
        url =
            urlBase ++ "/api/v1/users"
    in
        Http.send ProcessUserRequest (Http.get url userListDecoder)


onClickNoDefault : msg -> Attribute msg
onClickNoDefault message =
    let
        config =
            { stopPropagation = True
            , preventDefault = True
            }
    in
        onWithOptions "click" config (Json.Decode.succeed message)



-- Subscriptions


subscriptions : Model Msg -> Sub Msg
subscriptions model =
    Phoenix.Socket.listen model.phxSocket PhoenixMsg