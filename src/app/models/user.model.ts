import { Location } from "./location.model";

export interface User {
    // ======Account======
    id?: string,
    email?: string,
    password?: string,
    emailVerified?: boolean,
    photo?: string,

    // ======Owner data======
    fullName?: string,
    docType?: string,
    docNumber?: string,
    license?: string,

    // ======Company data======  
    companyName?: string,
    companyAddress?: string,
    country?: string,
    department?: string,
    town?: string,
    nit?: string,
    location?: Location,
    operators?: string[],
    properties?: string[]
}


