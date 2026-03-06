const isProd = process.env.NODE_ENV === "production";

function fmt(level: string, route: string, msg: string, data?: unknown) {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.log(JSON.stringify({ ts, level, route, msg, data }));
  } else {
    console.log(JSON.stringify({ ts, level, route, msg }));
  }
}

export function log(route: string, msg: string, data?: unknown) {
  fmt("INFO", route, msg, data);
}

export function warn(route: string, msg: string, data?: unknown) {
  fmt("WARN", route, msg, data);
}

export function error(route: string, msg: string, data?: unknown) {
  fmt("ERROR", route, msg, data);
}
