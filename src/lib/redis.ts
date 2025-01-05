import { Redis } from 'ioredis';

console.log('Redis configuration:');
console.log('Host:', '100.26.135.187');
console.log('Port:', '6379');
console.log('Password:', '[REDACTED]');

const redis = new Redis({
  host: '100.26.135.187',
  port: 6379,
  password: '5llncsGDzZ6Epqnpeunnu9Yxsunj5Vy2sGxr1JpEIG2ecampE9PZLb45hnwy1pov',
});

export default redis; 