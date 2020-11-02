import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as child_process from 'child_process';
import { Response } from 'express';
import { isEqual } from 'lodash';
import { Model } from 'mongoose';
import { StandartResponse } from 'src/interfaces';
import { UtilsService } from 'src/utils.service';
import Light from '../interfaces/light.interface';
import { Esp, EspDocument } from '../schemas/esp.schema';
import { UpdateLedsDto } from './dto/update-leds.dto';

@Injectable()
export class ColorsService {

    constructor(@InjectModel(Esp.name) private espModel: Model<EspDocument>, private utilsService: UtilsService) { }

    async updateLeds(id: string, data: UpdateLedsDto, res: Response<StandartResponse<Light>>): Promise<StandartResponse<Light>> {
        const oldLight: EspDocument = await this.espModel.findOne({ uuid: id }, { __v: 0, _id: 0 });
        const newLight: EspDocument = await this.espModel.findOneAndUpdate({ uuid: id }, { leds: { colors: data.colors ?? undefined, pattern: data.pattern ?? undefined } }, {
            new: true, projection: { __v: 0, _id: 0 }
        });
        if (isEqual(oldLight, newLight)) {
            res.status(304);
            return {
                message: "Nothing changed", object: {
                    count: newLight.count,
                    name: newLight.name,
                    id: newLight.uuid,
                    leds: newLight.leds,
                    tags: newLight.tags
                }
            };
        }

        const resLight: Light = {
            count: newLight.count,
            name: newLight.name,
            id: newLight.uuid,
            leds: newLight.leds,
            tags: newLight.tags
        }
        const colorArray: string[] = [];
        data.colors.forEach((color: string) => {
            colorArray.push('"' + this.utilsService.hexToRgb(color) + '"')
            console.log(this.utilsService.hexToRgb(color))
        })
        if (data.colors) {
            try {
                child_process.execSync(`echo '{"command": "leds", "data": {"colors": [${colorArray}], "pattern": "plain"}}' | nc ${newLight.ip} 2389`)
                console.log(`[${colorArray}], ${newLight.ip}`)
            } catch {
                throw new ServiceUnavailableException("The Light is not plugged in or not started yet!")
            }
        }
        res.send({ message: "Succesfully changed the color of the light!", object: resLight })
        return { message: "Succesfully changed the color of the light!", object: resLight };
    }

    async updateLedsWithTag(tag: string, data: UpdateLedsDto, res: Response<StandartResponse<Light[]>>): Promise<StandartResponse<Light[]>> {
        const oldLights: EspDocument[] = await this.espModel.find({ tags: {$all: [tag]} }, { __v: 0, _id: 0 });
        await this.espModel.updateMany({ tags: {$all: [tag]} }, { $set: { "leds": { colors: data.colors ?? undefined, pattern: data.pattern ?? undefined } } }, {
            new: true, projection: { __v: 0, _id: 0 }
        }).exec();
        const newLights: EspDocument[] = await this.espModel.find({ tags: {$all: [tag]} }).exec();

        //console.log(newLights[0])

        let resLights: Light[] = [];

        newLights.forEach(element => {
            resLights.push({
                count: element.count,
                name: element.name,
                id: element.uuid,
                leds: element.leds,
                tags: element.tags
            })
        });

        
        if (isEqual(oldLights, newLights)) {
                res.status(304);
                return {
                    message: "Nothing changed", object: resLights
                };
            }

        const colorArray: string[] = [];
        data.colors.forEach((color: string) => {
            colorArray.push('"' + this.utilsService.hexToRgb(color) + '"')
            console.log(this.utilsService.hexToRgb(color))
        })
        if (data.colors) {
            try {
                newLights.forEach(element => {
                    child_process.execSync(`echo '{"command": "leds", "data": {"colors": [${colorArray}], "pattern": "plain"}}' | nc ${element.ip} 2389`)
                    console.log(`[${colorArray}], ${element.ip}`)
                });
            } catch {
                throw new ServiceUnavailableException("The Light is not plugged in or not started yet!")
            }
        }
        res.send({ message: "Succesfully changed the color of the light!", object: resLights })
        return { message: "Succesfully changed the color of the light!", object: resLights };
    }
}