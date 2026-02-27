import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primary: httpOnly cookie
        (req: Request) => req?.cookies?.access_token ?? null,
        // Fallback: Authorization header (for dev tooling / tests)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    role: string;
    clinicianId?: string;
  } {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      clinicianId: payload.clinicianId,
    };
  }
}
