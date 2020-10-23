import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Esp, EspDocument } from './schemas/esp.schema';

@Injectable()
export class UtilsService {

    constructor(@InjectModel(Esp.name) private espModel: Model<EspDocument>) { }

    hexToRgb(hex: string): string {
        let colors: string[] = [];
        switch (hex.length) {
            case 3:
                colors = hex.split("");
                break;
            case 4:
                colors = hex.substring(1, 4).split("");
                break;
            case 6:
                colors = hex.match(/.{1,2}/g);
                break;
            case 7:
                colors = hex.substring(1, 7).match(/.{1,2}/g);
                break;

        }
        return parseInt(colors[0], 16) + "."
            + parseInt(colors[1], 16) + "."
            + parseInt(colors[2], 16)
    }


    makeValidHex(hex: string): string {
        let colors: string[] = [];
        switch (hex.length) {
            case 3:
                colors = hex.split("");
                break;
            case 4:
                colors = hex.substring(1, 4).split("");
                break;
            case 6:
                colors = hex.match(/.{1,3}/g);
                break;
            case 7:
                colors = hex.substring(1, 7).match(/.{1,3}/g);
                break;

        }
        return "#" + colors[0] + ""
            + colors[1] + ""
            + colors[2] + ""
    }

    async isIdValid(id: string): Promise<boolean> {
        console.log("vai")
        if ((await this.espModel.find({ uuid: id }).exec()).length) return true
        return false
    }
}