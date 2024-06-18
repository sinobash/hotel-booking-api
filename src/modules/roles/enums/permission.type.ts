import { UserAccess, RoleAccess } from './user-access.enum';
import { Facilities, Features, Countries, Currencies, Cities, Banners, Categories } from './master.enum';
import { Hotels, RoomTypes, Rooms, Bookings, Guests } from './hotel.enum';
import { Notifications } from './events.enum';

const Permission = {
    ...UserAccess,
    ...RoleAccess,
    ...Facilities,
    ...Features,
    ...Countries,
    ...Currencies,
    ...Cities,
    ...Banners,
    ...Categories,
    ...Hotels,
    ...RoomTypes,
    ...Rooms,
    ...Bookings,
    ...Guests,
    ...Notifications,
};

type Permission =
    | UserAccess
    | RoleAccess
    | Facilities
    | Features
    | Countries
    | Currencies
    | Cities
    | Banners
    | Categories
    | Hotels
    | RoomTypes
    | Rooms
    | Bookings
    | Guests
    | Notifications;

export default Permission;
