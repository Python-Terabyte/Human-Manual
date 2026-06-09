import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../../../packages/db/src/schema';

export const DRIZZLE = Symbol('DRIZZLE');
export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        const sql = neon(url);
        return drizzle(sql, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
