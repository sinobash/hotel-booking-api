import { Actions } from '../enums/actions.enum';

export class RolePermissionsResDto {
    user?: Actions[];
    role?: Actions[];
    facility?: Actions[];
    feature?: Actions[];
    country?: Actions[];
    currency?: Actions[];
    city?: Actions[];
    hotel?: Actions[];
    roomtype?: Actions[];
    room?: Actions[];
    guest?: Actions[];
    booking?: Actions[];
}
