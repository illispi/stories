import { createSolidAPIHandler } from '@solid-mediakit/trpc/handler'
import { createContext } from '~/server/trpc/context'
import { appRouter } from '~/server/trpc/router/_app'

const handler = createSolidAPIHandler({
  router: appRouter,
  //BUG this complains
  createContext,
})

export const { GET, POST } = handler