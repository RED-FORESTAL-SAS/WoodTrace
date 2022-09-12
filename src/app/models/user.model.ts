export interface User{
    id?: string,
    fullName?: string,
    email?: string,
    password?: string,
    docType?: string;
    docNumber?: string;
    license?: string;
    emailVerified?:boolean;
}