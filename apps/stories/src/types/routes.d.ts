declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/development/test": Record<string, never>;
    "/questionares": Record<string, never>;
    "/questionares/:personalQuestions": { "personalQuestions": string };
    "/stats": Record<string, never>;
    "/stats/:allStats": { "allStats": string };
    "/stats/compare": Record<string, never>;
    "/stats/texts/:selector/:statsText": { "selector": string, "statsText": string };
  };

  export function route<
    T extends
      | ["/"]
      | ["/development/test"]
      | ["/questionares"]
      | ["/questionares/:personalQuestions", RouteParams["/questionares/:personalQuestions"]]
      | ["/stats"]
      | ["/stats/:allStats", RouteParams["/stats/:allStats"]]
      | ["/stats/compare"]
      | ["/stats/texts/:selector/:statsText", RouteParams["/stats/texts/:selector/:statsText"]]
  >(...args: T): typeof args[0];
}
