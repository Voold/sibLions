import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'src', 'config', '.env') });

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  const envPath = path.resolve(process.cwd(), 'src', 'config', `.env.${env}`);
  dotenv.config({ path: envPath });
  console.log(`[[INFO]]: Local config loaded from: ${envPath}`);
} else {
  console.log(`[[INFO]]: Running in PRODUCTION mode`);
}
