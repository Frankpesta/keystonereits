export function userNotificationHref(type: string, relatedId?: string): string | null {
  if (type === "deposit_received_fiat") return relatedId ? `/dashboard/support/${relatedId}` : "/dashboard/support";
  if (type.startsWith("deposit_")) return "/dashboard/deposit";
  if (type.startsWith("withdrawal_")) return "/dashboard/withdraw";
  if (type.startsWith("investment_")) {
    return relatedId ? `/dashboard/investments/${relatedId}` : "/dashboard/investments";
  }
  if (type.startsWith("kyc_")) return "/dashboard/kyc";
  if (type === "support_reply") return relatedId ? `/dashboard/support/${relatedId}` : "/dashboard/support";
  return null;
}

export function adminNotificationHref(type: string, relatedId?: string): string | null {
  if (type === "admin_deposit_submitted") {
    return relatedId ? `/admin/deposits?depositId=${relatedId}` : "/admin/deposits";
  }
  if (type === "admin_withdrawal_requested") {
    return relatedId ? `/admin/withdrawals?withdrawalId=${relatedId}` : "/admin/withdrawals";
  }
  if (type === "admin_investment_created") {
    return relatedId ? `/admin/investments/${relatedId}` : "/admin/investments";
  }
  if (type === "admin_kyc_submitted") return relatedId ? `/admin/kyc/${relatedId}` : "/admin/kyc";
  return null;
}
