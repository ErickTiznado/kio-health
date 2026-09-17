import { Controller, Get } from '@nestjs/common';
import { AppService, type EstadoDelServicio } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * `GET /api/health`.
   *
   * Publico a proposito: tiene que poder consultarse desde fuera sin
   * credenciales, que es justo cuando hace falta. No expone nada sensible —
   * el SHA de un commit no abre ninguna puerta.
   *
   * Ojo con el nombre: antes de que esta ruta existiera, `/api/health` caia en
   * el ServeStaticModule y devolvia el index.html de la SPA con un 200. Es
   * decir, parecia que la API respondia cuando en realidad no la habia tocado
   * nadie. Si algun dia esto vuelve a devolver HTML, el que falta es este
   * handler.
   */
  @Public()
  @Get('health')
  getHealth(): EstadoDelServicio {
    return this.appService.getHealth();
  }
}
