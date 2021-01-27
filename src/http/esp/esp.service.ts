import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EspDocument } from "src/schemas/esp.schema";
import { DatabaseEspService } from "src/services/database/esp/database-esp.service";
import { SetupDto } from "./dto/setup.dto";
import { UpdateDto } from "./dto/update.dto";

@Injectable()
export class EspService {
  constructor(private databaseService: DatabaseEspService) {}

  async setup(data: SetupDto): Promise<string> {
    const ids: string[] = await this.databaseService
      .getEsps(true)
      .distinct("_id")
      .exec();
    let id: string;
    if (ids.length >= 256 * 256) {
      throw new ConflictException("This IP is already in use!");
    }

    do {
      id =
        Math.round(Math.random() * 255) + "." + Math.round(Math.random() * 255);
    } while (ids.includes(id));
    const name = "(new) Devlight";
    try {
      this.databaseService.addEsp({
        uuid: id,
        count: 0,
        name: name,
        ip: data.ip,
        leds: { pattern: "plain", colors: ["#1DE9B6"] },
        tags: [],
        isOn: true,
        brightness: 255,
      });
    } catch (e) {
      console.log(e);
      throw new ConflictException("This IP is already in use!");
    }
    return id;
  }

  async update(data: UpdateDto): Promise<void> {
    //TODO Look if esp really has been changed
    const oldDoc: EspDocument = await this.databaseService.getEspWithId(
      data.id,
    );
    if (oldDoc.ip === data.ip) {
      throw new NotFoundException();
    }
    await this.databaseService.updateEspWithId(data.id, { ip: data.ip });
    return;
  }
}
