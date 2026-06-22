import { extractClaims } from './claims';
import { CaesarClient } from './caesar';
import { verifyClaim, type Verdict } from './verify';
import { DEMO_RESPONSE } from '../fixtures/demo';

export interface ClaimResult {
  claim: string;
  verdict: Verdict;
  source?: { title: string; url: string; captureTime?: string };
  passage?: string;
}
export interface VerifyResponse { claims: ClaimResult[]; degraded: boolean; }

const RANK = { VERIFIED: 2, NEEDS_CONTEXT: 1, UNSUPPORTED: 0 } as const;

export async function runVerification(
  input: string,
  deps: { client?: CaesarClient } = {},
): Promise<VerifyResponse> {
  // Offline showcase / screenshots: force the cached demo response.
  if (process.env.VERIFIER_DEMO) return DEMO_RESPONSE;
  const client = deps.client ?? new CaesarClient();
  try {
    const claims = (await extractClaims(input)).slice(0, 6);
    if (claims.length === 0) return { claims: [], degraded: false };
    const results = await Promise.all(claims.map(async (claim): Promise<ClaimResult> => {
      const { citations } = await client.searchAndRead(claim, { readTopN: 3 });
      let best: ClaimResult = { claim, verdict: 'UNSUPPORTED' };
      for (const c of citations) {
        const { verdict } = verifyClaim({ claim, passage: c.passage });
        if (RANK[verdict] > RANK[best.verdict]) {
          best = {
            claim, verdict,
            source: { title: c.title, url: c.canonicalUrl, captureTime: c.captureTime },
            passage: c.passage,
          };
        }
      }
      return best;
    }));
    return { claims: results, degraded: false };
  } catch {
    return DEMO_RESPONSE;
  }
}
