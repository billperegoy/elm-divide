module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Time exposing (..)
import Task exposing (..)
import Process exposing (..)
import Date exposing (..)
import Array exposing (..)
import Json.Decode
import Json.Decode.Pipeline
import Http


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- Model


type alias FlashElement =
    { id : Int
    , text : String
    , color : String
    , duration : Time
    }



-- FIXME - Naively using strings instead of date/time


type alias Ticket =
    { id : Int
    , date : String
    , opponent : String
    , time : String
    , owner : Maybe String
    }


type alias TicketResponse =
    { id : Int
    , date : String
    , opponent : String
    , time : String
    }


type Role
    = Unregistered
    | Free
    | Paid
    | Admin


type alias User =
    { id : Int
    , name : String
    }


type alias Model =
    { tickets : List Ticket
    , flashElements : List FlashElement
    , nextId : Int
    , users : Array User
    , currentUser : Int
    , myName : String
    , systemError : String
    }


nullUser : User
nullUser =
    { id = -1
    , name = "guest"
    }


initTickets : List Ticket
initTickets =
    []


myTurn : Model -> Bool
myTurn model =
    let
        currentUserName =
            userField model model.currentUser .name
    in
        currentUserName == model.myName


initUsers : Array User
initUsers =
    [ User 0 "Joe"
    , User 1 "Bill"
    , User 2 "Kelly"
    , User 3 "David"
    , User 4 "John"
    ]
        |> Array.fromList


init : ( Model, Cmd Msg )
init =
    { tickets = initTickets
    , flashElements = []
    , nextId = 0
    , users = initUsers
    , currentUser = 0
    , myName = "Bill"
    , systemError = ""
    }
        ! [ ticketsRequest ]



-- Update


type Msg
    = CreateFlashElement String String Time
    | DeleteFlashElement Int Time
    | NextUser
    | SelectTicket Int
    | ProcessTicketRequest (Result Http.Error (List TicketResponse))


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
                    userField model nextUser .name

                color =
                    if nextUserName == model.myName then
                        "danger"
                    else
                        "info"
            in
                { model | currentUser = nextUser }
                    ! [ Task.succeed (CreateFlashElement (nextUserName ++ "'s turn") color 20)
                            |> Task.perform identity
                      ]

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

        SelectTicket id ->
            let
                newTickets =
                    List.map (\ticket -> markTicketSelected ticket id model.myName) model.tickets
            in
                { model | tickets = newTickets }
                    ! [ Task.succeed NextUser
                            |> Task.perform identity
                      ]

        ProcessTicketRequest (Ok tickets) ->
            let
                newTickets =
                    List.map transformTicketResponse tickets
            in
                { model | tickets = newTickets } ! []

        ProcessTicketRequest (Err error) ->
            let
                errorString =
                    error |> toString |> String.slice 0 120
            in
                { model | systemError = errorString } ! []


transformTicketResponse : TicketResponse -> Ticket
transformTicketResponse response =
    { id = response.id
    , date = response.date
    , opponent = response.opponent
    , time = response.time
    , owner = Nothing
    }


markTicketSelected : Ticket -> Int -> String -> Ticket
markTicketSelected ticket id userName =
    if ticket.id == id then
        { ticket | owner = Just userName }
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


userPlusButton : Model -> List (Html Msg)
userPlusButton model =
    [ h3 []
        [ span [ class "label label-default" ]
            [ text
                ("Logged In: " ++ model.myName)
            ]
        ]
    , h3 []
        [ span [ class "label label-default" ]
            [ text
                ("Up Now: " ++ (userField model model.currentUser .name))
            ]
        ]
    , button [ class "btn btn-default", onClick NextUser ] [ text "Next User" ]
    ]


flashView : Model -> Html Msg
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


header : Model -> Html Msg
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


ticketList : Bool -> List Ticket -> List (Html Msg)
ticketList myTurn tickets =
    List.map
        (\ticket -> singleTicket ticket myTurn)
        tickets


singleTicket : Ticket -> Bool -> Html Msg
singleTicket ticket myTurn =
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
            a [ onClick (SelectTicket ticket.id), href "#" ]
                [ innerDiv
                ]
        else
            innerDiv


remainingTickets : List Ticket -> Bool -> Html Msg
remainingTickets tickets myTurn =
    div
        [ class "col-md-4" ]
        [ h1 [ style [ ( "padding-bottom", "10px" ) ] ]
            [ span
                [ class "label label-primary" ]
                [ text "Remaining Tickets" ]
            ]
        , div []
            (List.filter
                (\ticket -> ticket.owner == Nothing)
                tickets
                |> ticketList myTurn
            )
        ]


userField : Model -> Int -> (User -> a) -> a
userField model index extractor =
    Array.get index model.users
        |> Maybe.withDefault nullUser
        |> extractor


myTickets : Model -> Html Msg
myTickets model =
    div [ class "col-md-4" ]
        [ h1 [ style [ ( "padding-bottom", "10px" ) ] ]
            [ span
                [ class "label label-primary" ]
                [ text "My Tickets" ]
            ]
        , div []
            (List.filter
                (\ticket -> ticket.owner == Just model.myName)
                model.tickets
                |> ticketList False
            )
        ]


view : Model -> Html Msg
view model =
    let
        itsMyTurn =
            myTurn model
    in
        div [ class "container" ]
            [ header model
            , div [ class "row" ]
                [ flashView model
                , remainingTickets model.tickets itsMyTurn
                , myTickets model
                ]
            ]



-- Decoders


ticketListDecoder : Json.Decode.Decoder (List TicketResponse)
ticketListDecoder =
    Json.Decode.list ticketDecoder


ticketDecoder : Json.Decode.Decoder TicketResponse
ticketDecoder =
    Json.Decode.Pipeline.decode TicketResponse
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "date" Json.Decode.string
        |> Json.Decode.Pipeline.required "opponent" Json.Decode.string
        |> Json.Decode.Pipeline.required "time" Json.Decode.string


userDecoder : Json.Decode.Decoder User
userDecoder =
    Json.Decode.Pipeline.decode User
        |> Json.Decode.Pipeline.required "id" Json.Decode.int
        |> Json.Decode.Pipeline.required "name" Json.Decode.string



-- FIXME - write a decoder to convert string to User union type
--         call that in the above pipeline


ticketsRequest : Cmd Msg
ticketsRequest =
    let
        url =
            "http://localhost:4000/api/v1/tickets"
    in
        Http.send ProcessTicketRequest (Http.get url ticketListDecoder)



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none
