import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const getPersonsDuration = new Trend('get_persons_duration', true);
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

export default function () {
  const res = http.get('https://reqres.in/api/users?page=2');

  rateStatusCodeOk.add(res.status === 200);

  check(res, {
    'status é 200': r => r.status === 200,
    'retornou dados': r => r.json('data').length > 0
  });

  sleep(1);
}
