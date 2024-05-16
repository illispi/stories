import { router } from "../utils";
import {
	acceptArticle,
	acceptSubmission,
	declineArticle,
	declineSubmission,
	fakeArticlesForDev,
	fakeForDev,
	fakeForDevBulk,
	fakeForFake,
} from "./admin/adminMutations";
import { listArticles, listSubmissions } from "./admin/adminQueries";
import { authStatus, logOut, signIn, signUp } from "./basic/authQandM";
import {
	postArticle,
	postPersonalStats,
	postTheirStats,
} from "./basic/mutations";
import { allStats, articlesPagination, textPagination } from "./basic/queries";
import {
	removeAccountAndData,
	removePersonal,
	removeTheir,
	removeArticle,
	editTheir,
	editPersonal,
} from "./user/userMutations";
import {
	getPersonal,
	getTheirs,
	getArticles,
	getNotifications,
} from "./user/userQueries";

export const appRouter = router({
	getNotifications,
	signIn,
	signUp,
	logOut,
	authStatus,
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
	getArticles,
	editPersonal,
	editTheir,
	fakeForDevBulk,
});

export type IAppRouter = typeof appRouter;
