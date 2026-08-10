/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_admins from "../admin/admins.js";
import type * as admin_auditLogs from "../admin/auditLogs.js";
import type * as admin_dashboard from "../admin/dashboard.js";
import type * as admin_deposits from "../admin/deposits.js";
import type * as admin_emailCenter from "../admin/emailCenter.js";
import type * as admin_investmentPlans from "../admin/investmentPlans.js";
import type * as admin_investments from "../admin/investments.js";
import type * as admin_kyc from "../admin/kyc.js";
import type * as admin_referrals from "../admin/referrals.js";
import type * as admin_reports from "../admin/reports.js";
import type * as admin_settings from "../admin/settings.js";
import type * as admin_support from "../admin/support.js";
import type * as admin_users from "../admin/users.js";
import type * as admin_withdrawals from "../admin/withdrawals.js";
import type * as admins from "../admins.js";
import type * as auth from "../auth.js";
import type * as balances from "../balances.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as deposits from "../deposits.js";
import type * as emailActions from "../emailActions.js";
import type * as emails from "../emails.js";
import type * as investmentPlans from "../investmentPlans.js";
import type * as investments from "../investments.js";
import type * as kyc from "../kyc.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_investments from "../lib/investments.js";
import type * as lib_ledger from "../lib/ledger.js";
import type * as lib_otp from "../lib/otp.js";
import type * as lib_password from "../lib/password.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_sessions from "../lib/sessions.js";
import type * as lib_testHelpers from "../lib/testHelpers.js";
import type * as lib_time from "../lib/time.js";
import type * as lib_withdrawals from "../lib/withdrawals.js";
import type * as notifications from "../notifications.js";
import type * as profitAccruals from "../profitAccruals.js";
import type * as referrals from "../referrals.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as support from "../support.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as withdrawals from "../withdrawals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/admins": typeof admin_admins;
  "admin/auditLogs": typeof admin_auditLogs;
  "admin/dashboard": typeof admin_dashboard;
  "admin/deposits": typeof admin_deposits;
  "admin/emailCenter": typeof admin_emailCenter;
  "admin/investmentPlans": typeof admin_investmentPlans;
  "admin/investments": typeof admin_investments;
  "admin/kyc": typeof admin_kyc;
  "admin/referrals": typeof admin_referrals;
  "admin/reports": typeof admin_reports;
  "admin/settings": typeof admin_settings;
  "admin/support": typeof admin_support;
  "admin/users": typeof admin_users;
  "admin/withdrawals": typeof admin_withdrawals;
  admins: typeof admins;
  auth: typeof auth;
  balances: typeof balances;
  contact: typeof contact;
  crons: typeof crons;
  deposits: typeof deposits;
  emailActions: typeof emailActions;
  emails: typeof emails;
  investmentPlans: typeof investmentPlans;
  investments: typeof investments;
  kyc: typeof kyc;
  "lib/audit": typeof lib_audit;
  "lib/auth": typeof lib_auth;
  "lib/crypto": typeof lib_crypto;
  "lib/investments": typeof lib_investments;
  "lib/ledger": typeof lib_ledger;
  "lib/otp": typeof lib_otp;
  "lib/password": typeof lib_password;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/sessions": typeof lib_sessions;
  "lib/testHelpers": typeof lib_testHelpers;
  "lib/time": typeof lib_time;
  "lib/withdrawals": typeof lib_withdrawals;
  notifications: typeof notifications;
  profitAccruals: typeof profitAccruals;
  referrals: typeof referrals;
  seed: typeof seed;
  settings: typeof settings;
  support: typeof support;
  transactions: typeof transactions;
  users: typeof users;
  withdrawals: typeof withdrawals;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
