import { WtCompany } from "../models/wt-company";
import { WtLicense } from "../models/wt-license";
import { WtUser } from "../models/wt-user";

/**
 * Describes the state of the current authenticated User, the Company where user belongs and the
 * license used to activate app features
 */
export interface UserState {
  /**
   * Company where user belongs. The one who bought the license.
   */
  company: WtCompany;

  /**
   * Active license for user.
   */
  license: WtLicense | null;

  /**
   * Current authenticated user.
   */
  user: WtUser | null;
}
