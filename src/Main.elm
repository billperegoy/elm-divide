module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Time exposing (..)
import Task exposing (..)
import Process exposing (..)
import Date exposing (..)
import Array exposing (..)


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


type Role
    = Unregistered
    | Free
    | Paid
    | Admin


type alias User =
    { name : String
    , role : Role
    }


type alias Model =
    { tickets : List Ticket
    , flashElements : List FlashElement
    , nextId : Int
    , users : Array User
    , currentUser : Int
    , myName : String
    }


nullUser : User
nullUser =
    { name = "guest"
    , role = Unregistered
    }


initTickets : List Ticket
initTickets =
    [ Ticket 0 "April 1" "Chicago" "7:10pm" Nothing
    , Ticket 1 "April 2" "Chicago" "7:10pm" Nothing
    , Ticket 2 "April 3" "Chicago" "1:05pm" Nothing
    , Ticket 3 "April 5" "Baltimore" "7:10pm" (Just "Bill")
    , Ticket 4 "April 6" "Baltimore" "7:10pm" Nothing
    , Ticket 5 "April 7" "Baltimore" "7:10pm" (Just "Joe")
    , Ticket 6 "April 8" "Toronto" "7:10pm" Nothing
    , Ticket 7 "April 9" "Toronto" "7:10pm" Nothing
    , Ticket 8 "April 10" "Toronto" "1:05pm" Nothing
    ]


myTurn : Model -> Bool
myTurn model =
    let
        currentUserName =
            userField model model.currentUser .name
    in
        currentUserName == model.myName


initUsers : Array User
initUsers =
    [ User "Joe" Paid
    , User "Bill" Paid
    , User "Kelly" Paid
    , User "David" Paid
    , User "John" Paid
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
    }
        ! []



-- Update


type Msg
    = CreateFlashElement String String Time
    | DeleteFlashElement Int Time
    | NextUser
    | SelectTicket Int


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
                { model | tickets = newTickets } ! []


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


header : Html Msg
header =
    div [ class "jumbotron text-center" ] [ h1 [] [ text "Dividasaurus" ] ]


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
                    [ text ticket.date ]
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
            [ header
            , div [ class "row" ]
                [ flashView model
                , remainingTickets model.tickets itsMyTurn
                , myTickets model
                ]
            ]



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none
