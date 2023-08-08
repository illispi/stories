declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/admin": Record<string, never>;
    "/admin/articles": Record<string, never>;
    "/admin/fake": Record<string, never>;
    "/admin/questions": Record<string, never>;
    "/development/test": Record<string, never>;
    "/questionares": Record<string, never>;
    "/questionares/:personalQuestions": { "personalQuestions": string };
    "/stats": Record<string, never>;
    "/user/data": Record<string, never>;
    "/stats/all": Record<string, never>;
    "/stats/all/:allStats": { "allStats": string };
    "/stats/compare": Record<string, never>;
    "/stats/compare/:compare": { "compare": string };
    "/stats/texts/:selector/:statsText": { "selector": string, "statsText": string };
  };

  export function route<
    T extends
      | ["/"]
      | ["/admin"]
      | ["/admin/articles"]
      | ["/admin/fake"]
      | ["/admin/questions"]
      | ["/development/test"]
      | ["/questionares"]
      | ["/questionares/:personalQuestions", RouteParams["/questionares/:personalQuestions"]]
      | ["/stats"]
      | ["/user/data"]
      | ["/stats/all"]
      | ["/stats/all/:allStats", RouteParams["/stats/all/:allStats"]]
      | ["/stats/compare"]
      | ["/stats/compare/:compare", RouteParams["/stats/compare/:compare"]]
      | ["/stats/texts/:selector/:statsText", RouteParams["/stats/texts/:selector/:statsText"]]
  >(...args: T): typeof args[0];
}
