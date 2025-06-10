// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // 1. Process the request and get the response from Astro's router/pages
  const response = await next();

  // 2. Set the X-Frame-Options header on the response
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // response.headers.set('Content-Security-Policy', "default-src 'self'");
   response.headers.set('Referrer-Policy', 'no-referrer');
  // response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
  // response.headers.set('X-Content-Type-Options', 'nosniff');
   response.headers.set('X-XSS-Protection', '1; mode=block');

  // 3. Return the modified response
  return response;
});
