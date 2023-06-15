import { Device } from "./device.model";
import { License } from "./license.model";
import { Location } from "./location.model";

export interface User {
  // ======Account======
  id?: string;
  email?: string;
  password?: string;
  emailVerified?: boolean;
  photo?: string;
  devices?: Device[];

  // ======Owner data======
  fullName?: string;
  docType?: string;
  docNumber?: string;
  license?: License;

  // ======Company data======
  companyName?: string;
  companyAddress?: string;
  country?: string;
  department?: string;
  town?: string;
  nit?: string;
  location?: Location;
  operators?: string[];
  properties?: string[];
}
