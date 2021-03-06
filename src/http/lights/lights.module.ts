import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LightValidationMiddleware } from "src/middlewares/light-validation.middleware";
import { CronModule } from "src/services/cron/cron.module";
import { CronService } from "src/services/cron/cron.service";
import { DatabaseModule } from "src/services/database/database.module";
import { Esp, EspSchema } from "../../schemas/esp.schema";
import { TcpModule } from "../../services/tcp/tcp.module";
import { EspUtilsService } from "../../services/utils/esp/esp.service";
import { UtilsService } from "../../services/utils/utils.service";
import { ColorService } from "./color/color.service";
import { ControlService } from "./control/control.service";
import { GeneralService } from "./general/general.service";
import { LightsController } from "./lights.controller";
import { SettingsService } from "./settings/settings.service";

@Module({
  controllers: [LightsController],
  providers: [
    ColorService,
    SettingsService,
    ControlService,
    UtilsService,
    GeneralService,
    EspUtilsService,
    CronService,
  ],
  imports: [
    DatabaseModule,
    TcpModule,
    CronModule,
    MongooseModule.forFeature([{ name: Esp.name, schema: EspSchema }]),
  ],
})
export class LightsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LightValidationMiddleware)
      .forRoutes({ path: "lights/:light(.*)", method: RequestMethod.ALL });
  }
}
