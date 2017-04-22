module Update exposing (update)

import Update.Actions as Actions exposing (..)


--

import Model exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NextUser ->
            Actions.nextUser model

        UpdateUserInputField text ->
            Actions.updateUserInputField model text

        SubmitUserInputField ->
            Actions.submitUserInputField model

        CreateFlashElement text color duration ->
            Actions.createFlashElementAction model text color duration

        DeleteFlashElement id time ->
            Actions.deleteFlashElement model id time

        ProcessTicketRequest (Ok tickets) ->
            Actions.processValidTicketRequest model tickets

        ProcessTicketRequest (Err error) ->
            Actions.processError model error

        ProcessUserRequest (Ok users) ->
            Actions.processValidUserRequest model users

        ProcessUserRequest (Err error) ->
            Actions.processError model error

        PhoenixMsg msg ->
            Actions.phoenixMsg model msg

        JoinChannel ->
            Actions.joinChannel model

        SendMessage ticketId userId ->
            Actions.sendMessage model ticketId userId

        ReceiveMessage message ->
            Actions.receiveMessage model message
