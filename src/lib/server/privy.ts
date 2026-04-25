import { PrivyClient, type LinkedAccount, type User, verifyAuthToken } from "@privy-io/node";

import { getOptionalEnv, requireEnv } from "@/lib/server/env";
import type { PrivyProfile } from "@/lib/referrals/types";

let privyClient: PrivyClient | null = null;

function getPrivyClient(): PrivyClient {
  if (privyClient) return privyClient;

  privyClient = new PrivyClient({
    appId: requireEnv("PRIVY_APP_ID"),
    appSecret: requireEnv("PRIVY_API_KEY"),
    jwtVerificationKey: getOptionalEnv("PRIVY_JWT_VERIFICATION_KEY"),
  });

  return privyClient;
}

export async function verifyPrivyRequest(authToken: string): Promise<string> {
  const appId = requireEnv("PRIVY_APP_ID");
  const verificationKey = getOptionalEnv("PRIVY_JWT_VERIFICATION_KEY");

  if (verificationKey) {
    const claims = await verifyAuthToken({
      auth_token: authToken,
      app_id: appId,
      verification_key: verificationKey,
    });

    return claims.user_id;
  }

  const claims = await getPrivyClient().utils().auth().verifyAuthToken(authToken);
  return claims.user_id;
}

export function getBearerToken(headers: Headers): string | null {
  const authorization = headers.get("authorization");
  if (!authorization?.toLowerCase().startsWith("bearer ")) return null;
  return authorization.slice("bearer ".length).trim();
}

export async function getPrivyProfile(privyUserId: string): Promise<PrivyProfile> {
  const user = await getPrivyClient().users()._get(privyUserId);
  return mapPrivyUser(user);
}

function mapPrivyUser(user: User): PrivyProfile {
  const email = user.linked_accounts.find(isEmailAccount)?.address ?? null;
  const twitter = user.linked_accounts.find(isTwitterAccount);
  const twitterUsername = twitter?.username ?? null;
  const displayName = twitter?.name ?? twitterUsername ?? email?.split("@")[0] ?? "Perminal user";

  return {
    privyUserId: user.id,
    email,
    twitterUsername,
    displayName,
    avatarUrl: twitter?.profile_picture_url ?? null,
  };
}

function isEmailAccount(account: LinkedAccount): account is Extract<LinkedAccount, { type: "email" }> {
  return account.type === "email";
}

function isTwitterAccount(account: LinkedAccount): account is Extract<LinkedAccount, { type: "twitter_oauth" }> {
  return account.type === "twitter_oauth";
}
