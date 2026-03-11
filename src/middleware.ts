import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 如果访问根路径，直接通过
  if (path === '/') {
    return NextResponse.next()
  }

  // 如果访问登录页，直接通过
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * /api (API routes)
     * /_next (Next.js internals)
     * /static (inside /public)
     * /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 