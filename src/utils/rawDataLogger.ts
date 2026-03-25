import fs from 'fs/promises';
import path from 'path';

export default async function dataLogger(data: any){
  try {
  const logPath = path.join(process.cwd(), 'tpu_raw_data.log');
  const logEntry = `
  [${new Date().toISOString()}]
  DATA: ${JSON.stringify(data, null, 2)}
  ---------------------------------------------------------
  `;
  await fs.appendFile(logPath, logEntry, 'utf8');
} catch (logError) {
  console.error('Failed to write TPU log file:', logError);
}
}