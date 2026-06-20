/**
 * @fileoverview tRPC procedure factory and shared middleware.
 *
 * Exports three procedure types used across all routers:
 *  - `publicProcedure`   — No authentication required.
 *  - `protectedProcedure` — Requires a valid session cookie; throws UNAUTHORIZED otherwise.
 *  - `adminProcedure`    — Requires `user.role === 'admin'`; throws FORBIDDEN otherwise.
 *
 * The tRPC instance uses `superjson` as its transformer so that Date objects,
 * Maps, Sets, and BigInts are serialised correctly over the wire.
 */

import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

/** Base router factory. Combine sub-routers with this. */
export const router = t.router;

/** Procedure with no authentication constraints. */
export const publicProcedure = t.procedure;

/**
 * Middleware that asserts a valid authenticated user exists in context.
 * Throws `UNAUTHORIZED` when the session cookie is absent or invalid.
 */
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/** Procedure that requires a valid authenticated session. */
export const protectedProcedure = t.procedure.use(requireUser);

/**
 * Procedure restricted to users with `role === 'admin'`.
 * Throws `FORBIDDEN` for authenticated non-admin users and
 * `UNAUTHORIZED` for unauthenticated requests.
 */
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
