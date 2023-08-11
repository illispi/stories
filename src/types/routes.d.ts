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
    "/stats/compare/:compare": { "compare": string };
    "/stats/pollResults": Record<string, never>;
    "/stats/pollResults/:pOrT/:fakeOrReal": { "pOrT": string, "fakeOrReal": string };
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
      | ["/stats/compare/:compare", RouteParams["/stats/compare/:compare"]]
      | ["/stats/pollResults"]
      | ["/stats/pollResults/:pOrT/:fakeOrReal", RouteParams["/stats/pollResults/:pOrT/:fakeOrReal"]]
      | ["/stats/texts/:selector/:statsText", RouteParams["/stats/texts/:selector/:statsText"]]
      | ["/user/data"]
  >(...args: T): typeof args[0];
}
