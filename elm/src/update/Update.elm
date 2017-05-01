module Update exposing (update)

import Update.Actions as Actions exposing (..)


--

import Model exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateUserInputField text ->
            Actions.updateUserInputField model text

        CreateUser ->
            Actions.createUser model

        LoginUser ->
            Actions.loginUser model

        CreateFlashElement text color duration ->
            Actions.createFlashElementAction model text color duration

        DeleteFlashElement id time ->
            Actions.deleteFlashElement model id time

        ProcessTicketGet (Ok tickets) ->
            Actions.processValidTicketGet model tickets

        ProcessTicketGet (Err error) ->
            Actions.processError model error

        ProcessUserGet (Ok users) ->
            Actions.processValidUserGet model users

        ProcessUserGet (Err error) ->
            Actions.processError model error

        ProcessUserPost (Ok user) ->
            Actions.processValidUserPost model user

        ProcessUserPost (Err error) ->
            Actions.processUserPostError model error

        ProcessGroupGet (Ok groups) ->
            Actions.processValidGroupGet model groups

        ProcessGroupGet (Err error) ->
            Actions.processError model error

        PhoenixMsg msg ->
            Actions.phoenixMsg model msg

        JoinChannel ->
            Actions.joinChannel model

        SendMessage ticketId userId groupName ->
            Actions.sendMessage model ticketId userId groupName

        ReceiveTicketMessage message ->
            Actions.receiveTicketMessage model message

        ReceiveActiveUserMessage message ->
            Actions.receiveActiveUserMessage model message
