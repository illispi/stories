import { createReactQueryHooks } from '@trpc/react-query';
import type { AppRouter } from '../../../server/src/router';

export const trpc = createReactQueryHooks<AppRouter>();
// => { useQuery: ..., useMutation: ...}