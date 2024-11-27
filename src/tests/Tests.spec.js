import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métrica personalizada para rastrear taxa de sucesso (status 200)
export let successRate = new Rate('success_rate');

export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 300 }
  ],
  thresholds: {
    success_rate: ['rate>=0.95'],
    'http_req_duration{status:200}': ['p(95)<5700'],
    http_req_failed: ['rate<0.12']
  }
};

export default function () {
  const res = http.get('https://reqres.in/api/users?page=2');

  successRate.add(res.status === 200);

  check(res, {
    'status é 200': r => r.status === 200,
    'retornou dados': r => r.json('data').length > 0
  });

  sleep(1);
}
