import { router } from "../utils";
import { allStats, articlesPagination, textPagination } from "./basic/queries";

export const appRouter = router({
  allStats,
  articlesPagination,
  textPagination,
});

export type IAppRouter = typeof appRouter;
