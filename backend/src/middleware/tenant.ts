import { Request, Response, NextFunction } from "express";

// Enforce hotel_id isolation from JWT or header
export interface TenantRequest extends Request {
  tenant?: { hotelId: string };
}

export function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction) {
  const headerHotelId = req.header("x-hotel-id");
  const jwtHotelId = (req as any).user?.hotelId as string | undefined; // set by auth middleware later
  const hotelId = jwtHotelId ?? headerHotelId;

  if (!hotelId) {
    return res.status(400).json({ message: "Missing hotel context" });
  }

  req.tenant = { hotelId };
  next();
}

