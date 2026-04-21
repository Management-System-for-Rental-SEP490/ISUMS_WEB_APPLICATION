export const ISSUE_TYPE_CONFIG = {
  REPAIR:   { i18nKey: "issues.issueTypeRepair",   bg: "rgba(251,146,60,0.12)",  color: "#c2410c" },
  QUESTION: { i18nKey: "issues.issueTypeQuestion", bg: "rgba(32,150,216,0.12)",  color: "#2096d8" },
};

export const ISSUE_STATUS_CONFIG = {
  CREATED:                              { i18nKey: "issues.issueStatusCreated",              bg: "rgba(90,122,110,0.10)",  color: "#5A7A6E",  dot: "#5A7A6E"  },
  WAITING_PAYMENT:                      { i18nKey: "issues.issueStatusWaitingPayment",       bg: "rgba(245,158,11,0.12)",  color: "#b45309",  dot: "#f59e0b"  },
  WAITING_MANAGER_APPROVAL:             { i18nKey: "issues.issueStatusWaitingApproval",      bg: "rgba(139,92,246,0.10)",  color: "#7c3aed",  dot: "#8b5cf6"  },
  WAITING_MANAGER_APPROVAL_QUOTE:       { i18nKey: "issues.issueStatusWaitingApprovalQuote", bg: "rgba(245,158,11,0.12)",  color: "#b45309",  dot: "#f59e0b"  },
  SCHEDULED:                            { i18nKey: "issues.issueStatusScheduled",            bg: "rgba(32,150,216,0.10)",  color: "#2096d8",  dot: "#2096d8"  },
  DONE:                                 { i18nKey: "issues.issueStatusDone",                 bg: "rgba(59,181,130,0.10)",  color: "#3bb582",  dot: "#3bb582"  },
  REJECTED:                             { i18nKey: "issues.issueStatusRejected",             bg: "rgba(217,95,75,0.10)",   color: "#D95F4B",  dot: "#D95F4B"  },
  CANCELLED:                            { i18nKey: "issues.issueStatusCancelled",            bg: "rgba(217,95,75,0.10)",   color: "#D95F4B",  dot: "#D95F4B"  },
};

export const IN_PROGRESS_STATUSES = ["WAITING_PAYMENT", "WAITING_MANAGER_APPROVAL", "SCHEDULED"];

export const ISSUE_STATUS_OPTIONS = Object.entries(ISSUE_STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

export const ISSUE_TYPE_OPTIONS = Object.entries(ISSUE_TYPE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));
