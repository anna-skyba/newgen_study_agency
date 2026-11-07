var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.js
var SOURCE_NAMES = {
  home: "\u0413\u043E\u043B\u043E\u0432\u043D\u0430 \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0430",
  contact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438",
  quiz: "\u0422\u0435\u0441\u0442 \u043F\u0456\u0434\u0431\u043E\u0440\u0443"
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
__name(json, "json");
function clean(value, maxLength = 1e3) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
__name(clean, "clean");
async function handleLead(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }
  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ ok: false, error: "Invalid content type" }, 415);
  }
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const limit = await env.LEAD_LIMIT.limit({
    key: `lead:${ip}`
  });
  if (!limit.success) {
    return json({
      ok: false,
      error: "Too many requests"
    }, 429);
  }
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 12e3) {
      return json({ ok: false, error: "Payload too large" }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, error: "Invalid data" }, 400);
  }
  if (body.website) {
    return json({ ok: true });
  }
  const source = clean(body.source, 30);
  const name = clean(body.name, 100);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 40);
  const packageName = clean(body.packageName, 100);
  const message = clean(body.message, 2e3);
  const quizDetails = clean(body.quizDetails, 4500);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!SOURCE_NAMES[source] || name.length < 2 || !emailValid || body.acceptedPrivacy !== true) {
    return json({
      ok: false,
      error: "Please check your form fields"
    }, 422);
  }
  if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
    console.error("Email environment variables are missing");
    return json({
      ok: false,
      error: "Email service is not configured"
    }, 503);
  }
  const subject = `[NewGen Study] \u041D\u043E\u0432\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u2014 ${SOURCE_NAMES[source]}`;
  const emailText = [
    "\u041D\u041E\u0412\u0410 \u0417\u0410\u042F\u0412\u041A\u0410 \u2014 NEWGEN STUDY",
    "================================",
    "",
    `\u0414\u0436\u0435\u0440\u0435\u043B\u043E: ${SOURCE_NAMES[source]}`,
    `\u0406\u043C\u2019\u044F: ${name}`,
    `Email: ${email}`,
    `\u0422\u0435\u043B\u0435\u0444\u043E\u043D: ${phone || "\u041D\u0435 \u0432\u043A\u0430\u0437\u0430\u043D\u043E"}`,
    `\u041F\u0430\u043A\u0435\u0442: ${packageName || "\u041D\u0435 \u043E\u0431\u0440\u0430\u043D\u043E"}`,
    "",
    "\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F:",
    message || "\u041D\u0435 \u0432\u043A\u0430\u0437\u0430\u043D\u043E",
    "",
    ...quizDetails ? [
      "\u0420\u0415\u0417\u0423\u041B\u042C\u0422\u0410\u0422\u0418 \u0422\u0415\u0421\u0422\u0423",
      "================================",
      quizDetails,
      ""
    ] : [],
    `\u0427\u0430\u0441 (UTC): ${(/* @__PURE__ */ new Date()).toISOString()}`
  ].join("\n");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.MAIL_TO],
        reply_to: email,
        subject,
        text: emailText
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Resend error:",
        response.status,
        errorText.slice(0, 500)
      );
      return json({
        ok: false,
        error: "Email provider rejected the request"
      }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error("Email request failed:", error);
    return json({
      ok: false,
      error: "Email service temporarily unavailable"
    }, 502);
  }
}
__name(handleLead, "handleLead");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") {
      return handleLead(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-C4BvZO/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-C4BvZO/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
