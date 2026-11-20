import { router } from "../utils";
import {
	acceptArticle,
	acceptSubmission,
	declineArticle,
	declineSubmission,
	deleteArticleAdmin,
	deleteUserAdmin,
	fakeArticlesForDev,
	fakeForDev,
	fakeForDevBulk,
	fakeForFake,
} from "./admin/adminMutations";
import { listArticles, listSubmissions, searchUsersByText } from "./admin/adminQueries";
import {
	postArticle,
	postPersonalStats,
	postTheirStats,
} from "./basic/mutations";
import { allStats, articlesPagination, authStatus, textPagination } from "./basic/queries";
import {
	removeAccountAndData,
	removePersonal,
	removeTheir,
	removeArticle,
	editTheir,
	editPersonal,
	editArticle,
	markRead,
} from "./user/userMutations";
import {
	getPersonal,
	getTheirs,
	getArticles,
	getNotifications,
} from "./user/userQueries";

export const appRouter = router({
	authStatus,
	markRead,
	getNotifications,
	allStats,
	articlesPagination,
	textPagination,
	postPersonalStats,
	postTheirStats,
	postArticle,
	acceptArticle,
	declineArticle,
	deleteArticleAdmin,
	deleteUserAdmin,
	searchUsersByText,
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
	editArticle,
	fakeForDevBulk,
});

export type IAppRouter = typeof appRouter;
