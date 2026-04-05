"""Shared enumerations for listings."""

from enum import Enum


class TransactionType(str, Enum):
    BUY = "buy"
    RENT = "rent"


class ListingType(str, Enum):
    FLAT = "flat"
    HOUSE = "house"
    DUPLEX = "duplex"
    ROOM = "room"
    PENTHOUSE = "penthouse"
