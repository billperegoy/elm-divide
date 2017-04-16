module View exposing (..)

import Array
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode
import Time
import Utils


--

import FlashElement
import Model exposing (..)
import Ticket exposing (..)
import User exposing (..)


durationString : Time.Time -> String
durationString val =
    if val == 0 then
        ""
    else
        toString val


userPlusButton : Model -> List (Html Msg)
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
                    ("Up Now: " ++ (Utils.userField model model.currentUser .name))
                ]
            ]
        , button [ class "btn btn-default", onClickNoDefault NextUser ] [ text "Next User" ]
        ]


flashView : Model -> Html Msg
flashView model =
    div [ class "col-md-2" ]
        ((userPlusButton model)
            ++ (flashViewElements model.flashElements)
        )


flashViewElements : List FlashElement.FlashElement -> List (Html Msg)
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


myTickets : Model -> Html Msg
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
                , remainingTickets model.tickets model.myUserId itsMyTurn
                , myTickets model
                ]
            ]


onClickNoDefault : msg -> Attribute msg
onClickNoDefault message =
    let
        config =
            { stopPropagation = True
            , preventDefault = True
            }
    in
        onWithOptions "click" config (Json.Decode.succeed message)


myTurn : Model -> Bool
myTurn model =
    let
        currentUserName =
            Array.get model.currentUser model.users
                |> Maybe.withDefault nullUser
                |> .name
    in
        currentUserName == model.myUserName
