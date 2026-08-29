"use server";

import { getDataScopeContext } from "@/lib/permissions/data-scope";
import {
  fetchCheckInOverview,
  fetchQueueOverview,
} from "@/lib/queue/overview";

export async function getQueueOverview() {
  const ctx = await getDataScopeContext();
  return fetchQueueOverview(ctx);
}

export async function getCheckInOverview() {
  const ctx = await getDataScopeContext();
  return fetchCheckInOverview(ctx);
}
