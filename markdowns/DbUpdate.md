1. in ./apps/server
   1. pnpm migrate:down
   2. pnpm migrate:latest
2. kysely codegen
   1. pnpm kysely-codegen --dialect postgres
   2. import { DB } from 'kysely-codegen' by opening this
   3. copy .\node_modules\kysely-codegen\dist\index.d.ts to db/dbTypes.ts
   4. Look at the differences from git
3. in ./apps/server
   1. pnpm ts-to-zod --skipValidation src/types/dbTypes.ts src/types/zodFromTypes.ts
4. Copy zodFromTypes to zodSchemasAndTypes and copy last bit infers from orig. zodSchemasAndTypes and comment out users for now



