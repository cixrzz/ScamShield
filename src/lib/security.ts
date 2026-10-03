export type SecuritySignal = {
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  explanation: string;
};

export type SecurityAnalysis = {
  riskScore: number;
  signals: SecuritySignal[];
};

const urgencyWords = [
  "urgent",
  "immediately",
  "act now",
  "right away",
  "final warning",
  "within 24 hours",
  "expires today",
  "account will be closed",
  "account will be suspended",
];

const credentialWords = [
  "password",
  "pin",
  "verification code",
  "security code",
  "login",
  "credentials",
  "one-time code",
  "otp",
];

const financialWords = [
  "payment",
  "bank account",
  "credit card",
  "debit card",
  "transfer",
  "gift card",
  "money",
];

const threatWords = [
  "suspended",
  "deleted",
  "legal action",
  "penalty",
  "locked",
  "terminated",
];
const impersonationTargets = [
  "amazon",
  "paypal",
  "microsoft",
  "apple",
  "google",
  "netflix",
  "discord",
  "instagram",
  "facebook",
  "bank",
  "irs",
  "usps",
  "fedex",
  "ups",
];
export function analyzeSecurity(text: string): SecurityAnalysis {
  const lowerText = text.toLowerCase();

  const signals: SecuritySignal[] = [];
  let riskScore = 0;

  // Urgency
  const urgencyFound = urgencyWords.filter((word) =>
    lowerText.includes(word)
  );

  if (urgencyFound.length > 0) {
    riskScore += 10;

    signals.push({
      type: "urgency",
      severity: "medium",
      title: "Urgency or pressure",
      explanation:
        "The message pressures the recipient to act quickly instead of giving them time to verify the request.",
    });
  }

  // Credentials
  const credentialsFound = credentialWords.filter((word) =>
    lowerText.includes(word)
  );

  if (credentialsFound.length > 0) {
    riskScore += 25;

    signals.push({
      type: "credentials",
      severity: "high",
      title: "Credential request",
      explanation:
        "The message mentions sensitive authentication information such as a password, PIN, or verification code.",
    });
  }

  // Financial information
  const financialFound = financialWords.filter((word) =>
    lowerText.includes(word)
  );

  if (financialFound.length > 0) {
    riskScore += 25;

    signals.push({
      type: "financial",
      severity: "high",
      title: "Financial request",
      explanation:
        "The message mentions money, payment information, financial accounts, or a transfer.",
    });
  }

  // Threats
  const threatsFound = threatWords.filter((word) =>
    lowerText.includes(word)
  );

  if (threatsFound.length > 0) {
    riskScore += 10;

    signals.push({
      type: "threat",
      severity: "medium",
      title: "Threat or consequence",
      explanation:
        "The message suggests a negative consequence if the recipient does not act.",
    });
  }
  // Impersonation
  const impersonationFound = impersonationTargets.filter((target) =>
    lowerText.includes(target)
  );

  if (impersonationFound.length > 0) {
    riskScore += 15;

    signals.push({
      type: "impersonation",
      severity: "medium",
      title: "Possible impersonation",
      explanation:
        "The message references a known company or organization. Verify that the message actually came from that organization before taking action.",
    });
  }

// URLs
const urlPattern = /(https?:\/\/[^\s]+)/gi;
const urls = text.match(urlPattern);

if (urls && urls.length > 0) {
  for (const url of urls) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      const trustedDomains = [
        "amazon.com",
        "paypal.com",
        "microsoft.com",
        "apple.com",
        "google.com",
        "netflix.com",
        "discord.com",
        "instagram.com",
        "facebook.com",
        "usps.com",
        "fedex.com",
        "ups.com",
      ];

      const brandDomains = [
  "amazon",
  "paypal",
  "microsoft",
  "apple",
  "google",
  "netflix",
  "discord",
  "instagram",
  "facebook",
  "usps",
  "fedex",
  "ups",
];

      const isTrustedDomain = trustedDomains.some(
        (domain) =>
          hostname === domain || hostname.endsWith(`.${domain}`)
      );

      const impersonatedBrand = brandDomains.find(
  (brand) =>
    hostname.includes(brand) &&
    !hostname.endsWith(`.${brand}.com`) &&
    hostname !== `${brand}.com`
);
      if (isTrustedDomain) {
        riskScore += 10;

        signals.push({
          type: "url",
          severity: "low",
          title: "Link detected",
          explanation:
            "The link appears to use a domain associated with the organization mentioned in the message. Verify the exact address before opening it.",
        });
      } else {
        riskScore += 30;
        if (impersonatedBrand) {
  signals.push({
    type: "brand_impersonation",
    severity: "high",
    title: "Possible brand impersonation",
    explanation:
      `The domain contains "${impersonatedBrand}" but does not use the organization's official domain.`,
  });
}

        signals.push({
          type: "suspicious_url",
          severity: "high",
          title: "Suspicious link",
          explanation:
            `The link uses the domain "${hostname}", which is not on ScamShield's trusted domain list.`,
        });
      }
    } catch {
      riskScore += 30;

      signals.push({
        type: "suspicious_url",
        severity: "high",
        title: "Invalid or suspicious link",
        explanation:
          "The web address could not be safely interpreted and should not be trusted without verification.",
      });
    }
  }
}
  // Maximum score
  riskScore = Math.min(riskScore, 100);

  return {
    riskScore,
    signals,
  };
}