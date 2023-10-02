import { router } from "../utils";
import { acceptArticle, acceptSubmission, declineArticle, declineSubmission, fakeArticlesForDev, fakeForDev, fakeForFake } from "./admin/adminMutations";
import { listArticles, listSubmissions } from "./admin/adminQueries";
import { postArticle, postPersonalStats, postTheirStats } from "./basic/mutations";
import { allStats, articlesPagination, textPagination } from "./basic/queries";
import { removeAccountAndData, removePersonal, removeTheir, removeArticle } from "./user/userMutations";
import { getPersonal, getTheirs, getArticles } from "./user/userQueries";

export const appRouter = router({
  allStats,
  articlesPagination,
  textPagination,
  postPersonalStats,
  postTheirStats,
  postArticle,
  acceptArticle,
  declineArticle,
  acceptSubmission,
  declineSubmission,
  fakeForFake,
  fakeForDev,
  fakeArticlesForDev,
  listSubmissions,
  listArticles,
  removeAccountAndData,
  removePersonal,
  removeTheir,
  removeArticle,
  getPersonal,
  getTheirs,
  getArticles
});

export type IAppRouter = typeof appRouter;
