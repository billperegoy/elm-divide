module Update exposing (update)

import Update.Utils exposing (..)


--

import Model exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NextUser ->
            Update.Utils.nextUser model

        UpdateUserInputField text ->
            Update.Utils.updateUserInputField model text

        SubmitUserInputField ->
            Update.Utils.submitUserInputField model

        CreateFlashElement text color duration ->
            Update.Utils.createFlashElementAction model text color duration

        DeleteFlashElement id time ->
            Update.Utils.deleteFlashElement model id time

        ProcessTicketRequest (Ok tickets) ->
            Update.Utils.processValidTicketRequest model tickets

        ProcessTicketRequest (Err error) ->
            Update.Utils.processErrorTicketRequest model error

        ProcessUserRequest (Ok users) ->
            Update.Utils.processValidUserRequest model users

        ProcessUserRequest (Err error) ->
            Update.Utils.processErrorUserRequest model error

        PhoenixMsg msg ->
            Update.Utils.phoenixMsg model msg

        JoinChannel ->
            Update.Utils.joinChannel model

        SendMessage ticketId userId ->
            Update.Utils.sendMessage model ticketId userId

        ReceiveMessage message ->
            Update.Utils.receiveMessage model message
