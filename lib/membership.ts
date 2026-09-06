export function buildMembershipActivation({
  userId,
  planId,
  paymentRequestId,
  accessKey,
  startDate,
  durationDays,
}: {
  userId: string;
  planId: string;
  paymentRequestId?: string | null;
  accessKey?: string | null;
  startDate: Date;
  durationDays: number;
}) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (durationDays || 30));

  const payload: Record<string, string | boolean | Date> = {
    user_id: userId,
    plan_id: planId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    is_active: true,
    auto_renew: false,
  };

  if (accessKey) {
    payload.access_key = accessKey;
    payload.access_key_issued_at = startDate.toISOString();
  }

  if (paymentRequestId) {
    payload.payment_request_id = paymentRequestId;
  }

  return payload;
}

export function normalizeMembershipDuplicates<
  T extends {
    id?: string;
    user_id?: string;
    end_date?: string | null;
    created_at?: string | null;
    is_active?: boolean;
  },
>(rows: T[]) {
  if (!rows.length) {
    return { canonicalId: null as string | null, duplicateIds: [] as string[] };
  }

  const activeRows = rows.filter((row) => row.is_active !== false);
  if (!activeRows.length) {
    return {
      canonicalId: null as string | null,
      duplicateIds: rows
        .map((row) => row.id)
        .filter((id): id is string => Boolean(id)),
    };
  }

  const canonical = activeRows.reduce((winner, current) => {
    const winnerEnd = new Date(
      winner.end_date || winner.created_at || 0,
    ).getTime();
    const currentEnd = new Date(
      current.end_date || current.created_at || 0,
    ).getTime();

    if ((current.id && !winner.id) || currentEnd > winnerEnd) {
      return current;
    }

    return winner;
  }, activeRows[0]);

  const canonicalId = canonical.id ?? null;
  const duplicateIds = activeRows
    .filter((row) => !!row.id && row.id !== canonicalId)
    .map((row) => row.id as string);

  return {
    canonicalId,
    duplicateIds,
  };
}

export async function activateMembershipForPayment(
  db: { rpc: (...args: any[]) => any },
  {
    paymentRequestId,
    accessKey,
    reviewedBy,
  }: {
    paymentRequestId: string;
    accessKey?: string | null;
    reviewedBy?: string | null;
  },
) {
  const { data, error } = await db.rpc("activate_membership_for_payment", {
    p_payment_request_id: paymentRequestId,
    p_access_key: accessKey ?? null,
    p_reviewed_by: reviewedBy ?? null,
  });

  if (error) throw new Error(error.message);
  return data as {
    payment_request_id: string;
    membership_id: string;
    already_activated: boolean;
  };
}
