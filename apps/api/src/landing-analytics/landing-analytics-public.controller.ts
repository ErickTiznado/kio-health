import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { LandingAnalyticsService } from './landing-analytics.service';
import { TrackLandingVisitDto } from './dto/track-landing-visit.dto';

/**
 * Recepción de beacons de la landing pública.
 *
 * Controller separado del de consulta a propósito: son la misma feature pero
 * dos superficies muy distintas —una anónima que escribe, otra autenticada que
 * lee— y mezclarlas en una clase invita a que un `@Public()` se cuele donde no
 * toca. Los prefijos también son distintos (`landing` vs `landing-analytics`)
 * para que `route-collisions.spec.ts` no tenga nada que reprochar.
 */
@Controller('landing')
export class LandingAnalyticsPublicController {
  constructor(private readonly service: LandingAnalyticsService) {}

  /**
   * Una visita manda varios beacons (entrada, ocultar pestaña, waitlist), y en
   * móvil el usuario puede alternar de app varias veces. 20/min por IP deja
   * sitio de sobra a eso y sigue cerrando la puerta a un bucle automatizado.
   */
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('track')
  async track(@Body() dto: TrackLandingVisitDto): Promise<void> {
    await this.service.track(dto);
  }
}
