declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/admin": Record<string, never>;
    "/admin/articles": Record<string, never>;
    "/admin/fake": Record<string, never>;
    "/admin/questions": Record<string, never>;
    "/development/test": Record<string, never>;
    "/login": Record<string, never>;
    "/questionares": Record<string, never>;
    "/questionares/:personalQuestions": { "personalQuestions": string };
    "/stats": Record<string, never>;
    "/stats/compare": Record<string, never>;
    "/stats/compare/:pOrT/:fOrT/compare": { "pOrT": string, "fOrT": string };
    "/stats/pollResults": Record<string, never>;
    "/stats/pollResults/:pOrT/:fOrT/pollResults": { "pOrT": string, "fOrT": string };
    "/stats/texts/:selector/:statsText": { "selector": string, "statsText": string };
    "/user/data": Record<string, never>;
  };

  export function route<
    T extends
      | ["/"]
      | ["/admin"]
      | ["/admin/articles"]
      | ["/admin/fake"]
      | ["/admin/questions"]
      | ["/development/test"]
      | ["/login"]
      | ["/questionares"]
      | ["/questionares/:personalQuestions", RouteParams["/questionares/:personalQuestions"]]
      | ["/stats"]
      | ["/stats/compare"]
      | ["/stats/compare/:pOrT/:fOrT/compare", RouteParams["/stats/compare/:pOrT/:fOrT/compare"]]
      | ["/stats/pollResults"]
      | ["/stats/pollResults/:pOrT/:fOrT/pollResults", RouteParams["/stats/pollResults/:pOrT/:fOrT/pollResults"]]
      | ["/stats/texts/:selector/:statsText", RouteParams["/stats/texts/:selector/:statsText"]]
      | ["/user/data"]
  >(...args: T): typeof args[0];
}
