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
    { date : String
    , opponent : String
    , time : String
    , owner : Maybe String
    }


type alias User =
    { name : String
    }


type alias Model =
    { tickets : List Ticket
    , flashElements : List FlashElement
    , nextId : Int
    , users : Array User
    , currentUser : Int
    , myName : String
    }


initTickets : List Ticket
initTickets =
    [ Ticket "April 1" "Chicago" "7:10pm" Nothing
    , Ticket "April 2" "Chicago" "7:10pm" Nothing
    , Ticket "April 3" "Chicago" "1:05pm" Nothing
    , Ticket "April 5" "Baltimore" "7:10pm" Nothing
    , Ticket "April 6" "Baltimore" "7:10pm" Nothing
    , Ticket "April 7" "Baltimore" "7:10pm" Nothing
    , Ticket "April 8" "Toronto" "7:10pm" Nothing
    , Ticket "April 9" "Toronto" "7:10pm" Nothing
    , Ticket "April 10" "Toronto" "1:05pm" Nothing
    ]


initUsers : Array User
initUsers =
    [ User "Joe"
    , User "Bill"
    , User "Kelly"
    , User "Joe"
    , User "John"
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


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
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


flashView : List FlashElement -> Html Msg
flashView elements =
    div []
        (flashViewElements elements)


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
    div [ class "jumbotron" ] [ h1 [] [ text "Divider" ] ]


remainingTickets : List Ticket -> Html Msg
remainingTickets tickets =
    div [ class "col-md-6" ]
        (List.filter
            (\ticket -> ticket.owner == Nothing)
            tickets
            |> List.map
                (\ticket -> div [] [ text ticket.date ])
        )


currentUserName : Model -> String
currentUserName model =
    let
        lookup =
            Array.get model.currentUser model.users
    in
        case lookup of
            Nothing ->
                "unknown"

            Just user ->
                user.name


myTickets : Model -> Html Msg
myTickets model =
    div [ class "col-md-6" ]
        [ div [] [ text ("It's " ++ currentUserName model ++ "'s turn") ]
        , div [] [ text model.myName ]
        ]


view : Model -> Html Msg
view model =
    div [ class "container" ]
        [ header
        , div [ class "row" ]
            [ flashView model.flashElements ]
        , div [ class "row" ]
            [ remainingTickets model.tickets
            , myTickets model
            ]
        ]



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none
