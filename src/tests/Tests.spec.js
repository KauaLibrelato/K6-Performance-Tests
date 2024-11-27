import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const getUserDuration = new Trend('get_persons_duration', true);
export const rateStatusCodeOk = new Rate('rate_status_code_ok');

export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 300 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<5700'],
    rate_status_code_ok: ['rate>0.95'],
    http_req_failed: ['rate<0.12']
  }
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const res = http.get('https://reqres.in/api/users?page=2');

  getUserDuration.add(res.timings.duration);

  rateStatusCodeOk.add(res.status === 200);

  check(res, {
    'status é 200': r => r.status === 200,
    'retornou dados': r => r.json('data').length > 0
  });

  sleep(1);
}
