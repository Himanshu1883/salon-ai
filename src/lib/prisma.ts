import type { PrismaClient } from "@/generated/prisma/client";
import { getPrismaClient } from "@/lib/create-prisma-client";
import { withDbRetry } from "@/lib/with-db-retry";

function callOnFreshClient(prop: PropertyKey, args: unknown[]) {
  return withDbRetry(async () => {
    const client = getPrismaClient() as object;
    const value = Reflect.get(client, prop, client);
    if (typeof value !== "function") {
      return value;
    }
    return await (value as (...fnArgs: unknown[]) => unknown).apply(
      client,
      args
    );
  });
}

function callOnFreshModel(
  modelKey: PropertyKey,
  op: PropertyKey,
  args: unknown[]
) {
  return withDbRetry(async () => {
    const client = getPrismaClient() as object;
    const model = Reflect.get(client, modelKey, client) as object;
    const value = Reflect.get(model, op, model);
    if (typeof value !== "function") {
      return value;
    }
    return await (value as (...fnArgs: unknown[]) => unknown).apply(
      model,
      args
    );
  });
}

function createModelProxy(modelKey: PropertyKey) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") return undefined;
        const model = Reflect.get(
          getPrismaClient() as object,
          modelKey
        ) as object | undefined;
        const nested =
          model && typeof model === "object"
            ? Reflect.get(model, prop, model)
            : undefined;
        if (typeof nested !== "function") {
          return nested;
        }
        return (...args: unknown[]) =>
          callOnFreshModel(modelKey, prop, args);
      },
    }
  );
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined;
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return (...args: unknown[]) => callOnFreshClient(prop, args);
    }
    if (value && typeof value === "object") {
      return createModelProxy(prop);
    }
    return value;
  },
});
