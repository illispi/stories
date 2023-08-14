declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/admin": Record<string, never>;
    "/admin/articles": Record<string, never>;
    "/admin/fake": Record<string, never>;
    "/admin/questions": Record<string, never>;
    "/articles": Record<string, never>;
    "/compare": Record<string, never>;
    "/compare/:pOrT/:fOrT/compare": { "pOrT": string, "fOrT": string };
    "/login": Record<string, never>;
    "/pollResults": Record<string, never>;
    "/pollResults/:pOrT/:fOrT/pollResults": { "pOrT": string, "fOrT": string };
    "/questionares": Record<string, never>;
    "/questionares/:personalQuestions": { "personalQuestions": string };
    "/stats": Record<string, never>;
    "/texts/:selector/:statsText": { "selector": string, "statsText": string };
    "/user/data": Record<string, never>;
  };

  export function route<
    T extends
      | ["/"]
      | ["/admin"]
      | ["/admin/articles"]
      | ["/admin/fake"]
      | ["/admin/questions"]
      | ["/articles"]
      | ["/compare"]
      | ["/compare/:pOrT/:fOrT/compare", RouteParams["/compare/:pOrT/:fOrT/compare"]]
      | ["/login"]
      | ["/pollResults"]
      | ["/pollResults/:pOrT/:fOrT/pollResults", RouteParams["/pollResults/:pOrT/:fOrT/pollResults"]]
      | ["/questionares"]
      | ["/questionares/:personalQuestions", RouteParams["/questionares/:personalQuestions"]]
      | ["/stats"]
      | ["/texts/:selector/:statsText", RouteParams["/texts/:selector/:statsText"]]
      | ["/user/data"]
  >(...args: T): typeof args[0];
}
