#!/usr/bin/env node
// Замер скорости скачивания: N последовательных запросов к одному адресу.

const REQUESTS = 10;

async function timedRequest(url) {
  const start = performance.now();
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  // arrayBuffer() ждёт, пока тело ответа будет получено полностью
  const body = await response.arrayBuffer();
  const seconds = (performance.now() - start) / 1000;
  return { bytes: body.byteLength, seconds };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Использование: node speedtest.js <url>");
    process.exit(1);
  }
  try {
    new URL(url);
  } catch {
    console.error(`Некорректный адрес: ${url}`);
    process.exit(1);
  }

  console.log(`Адрес: ${url}`);
  console.log(`Запросов: ${REQUESTS} (последовательно)\n`);

  let totalBytes = 0;
  let totalSeconds = 0;

  for (let i = 1; i <= REQUESTS; i++) {
    try {
      const { bytes, seconds } = await timedRequest(url);
      totalBytes += bytes;
      totalSeconds += seconds;
      console.log(
        `#${String(i).padStart(2)}: ${(bytes / 1e6).toFixed(2)} МБ за ${seconds.toFixed(3)} с`
      );
    } catch (err) {
      console.error(`Запрос #${i} не удался: ${err.message}`);
      process.exit(1);
    }
  }

  const avgSeconds = totalSeconds / REQUESTS;
  // Мбит/с = байты * 8 / секунды / 1 000 000
  const mbitPerSec = (totalBytes * 8) / totalSeconds / 1e6;

  console.log("\n--- Результат ---");
  console.log(`Среднее время запроса: ${avgSeconds.toFixed(3)} с`);
  console.log(`Скачано всего: ${(totalBytes / 1e6).toFixed(2)} МБ`);
  console.log(`Скорость скачивания: ${mbitPerSec.toFixed(2)} Мбит/с`);
}

main();
