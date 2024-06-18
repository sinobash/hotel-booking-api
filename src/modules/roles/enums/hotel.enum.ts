export enum Hotels {
    CreateHotel = 'hotel.create',
    ReadHotel = 'hotel.read',
    UpdateHotel = 'hotel.update',
    DeleteHotel = 'hotel.delete',
    UploadHotel = 'hotel.upload',
}

export enum RoomTypes {
    CreateRoomType = 'roomtype.create',
    ReadRoomType = 'roomtype.read',
    UpdateRoomType = 'roomtype.update',
    DeleteRoomType = 'roomtype.delete',
    UploadRoomType = 'roomtype.upload',
}

export enum Rooms {
    CreateRoom = 'room.create',
    ReadRoom = 'room.read',
    UpdateRoom = 'room.update',
    DeleteRoom = 'room.delete',
    UploadRoom = 'room.upload',
    AssignRoom = 'room.assign',
}

export enum Bookings {
    CreateBooking = 'booking.create',
    ReadBooking = 'booking.read',
    UpdateBooking = 'booking.update',
    DeleteBooking = 'booking.delete',
    AssignBooking = 'booking.assign',
}

export enum Guests {
    CreateGuest = 'guest.create',
    ReadGuest = 'guest.read',
    UpdateGuest = 'guest.update',
    DeleteGuest = 'guest.delete',
    VerifyGuest = 'guest.verify',
}
