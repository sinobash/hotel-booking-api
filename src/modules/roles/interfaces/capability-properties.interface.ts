import { Actions } from '../enums/actions.enum';

export interface CapabilityProperties {
    user?: Actions[];
    role?: Actions[];
    facility: Actions[];
    feature: Actions[];
    country: Actions[];
    currency: Actions[];
    city: Actions[];
    banner: Actions[];
    category: Actions[];
    hotel: Actions[];
    roomtype: Actions[];
    room: Actions[];
    guest: Actions[];
    booking: Actions[];
    notification: Actions[];
}
