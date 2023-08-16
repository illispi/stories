declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/admin": Record<string, never>;
    "/admin/adminCrud": Record<string, never>;
    "/admin/fake": Record<string, never>;
    "/articles": Record<string, never>;
    "/compare": Record<string, never>;
    "/compare/:pOrT/:fOrT/compare": { "pOrT": string, "fOrT": string };
    "/login": Record<string, never>;
    "/pollResults": Record<string, never>;
    "/pollResults/:pOrT/:fOrT/pollResults": { "pOrT": string, "fOrT": string };
    "/questionares": Record<string, never>;
    "/questionares/:personalQuestions": { "personalQuestions": string };
    "/texts/:selector/:statsText": { "selector": string, "statsText": string };
    "/user/data": Record<string, never>;
  };

  export function route<
    T extends
      | ["/"]
      | ["/admin"]
      | ["/admin/adminCrud"]
      | ["/admin/fake"]
      | ["/articles"]
      | ["/compare"]
      | ["/compare/:pOrT/:fOrT/compare", RouteParams["/compare/:pOrT/:fOrT/compare"]]
      | ["/login"]
      | ["/pollResults"]
      | ["/pollResults/:pOrT/:fOrT/pollResults", RouteParams["/pollResults/:pOrT/:fOrT/pollResults"]]
      | ["/questionares"]
      | ["/questionares/:personalQuestions", RouteParams["/questionares/:personalQuestions"]]
      | ["/texts/:selector/:statsText", RouteParams["/texts/:selector/:statsText"]]
      | ["/user/data"]
  >(...args: T): typeof args[0];
}
