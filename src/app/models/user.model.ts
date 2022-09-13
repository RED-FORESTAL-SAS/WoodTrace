export interface User{
    id?: string,
    photo?: string;
    fullName?: string,
    email?: string,
    password?: string,
    docType?: string;
    docNumber?: string;
    license?: string;
    emailVerified?:boolean;
    companyName?: string;
    companyAddress?: string;
    country?: string;
    nit?: string;
}