import { NextResponse, type NextRequest } from "next/server";
import { internalToolsEnabled, isInternalPath } from "@/lib/internal-gate";

export function proxy(request: NextRequest) {
  if (isInternalPath(request.nextUrl.pathname) && !internalToolsEnabled()) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/munka", "/munka/:path*"],
};

export default proxy;
