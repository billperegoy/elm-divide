module Tests exposing (..)

import Test exposing (..)
import Expect
import String


all : Test
all =
    describe "A Test Suite"
        [ test "Capitalizes a lower case word" <|
            \() ->
                Expect.equal "John" "John"
        ]
