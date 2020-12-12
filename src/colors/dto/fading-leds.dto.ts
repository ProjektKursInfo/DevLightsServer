import { IsHexColor, IsInt, IsNotEmpty, IsString } from "class-validator";
import { isInteger } from "lodash";

export class FadingLedsDto {
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;

  @IsInt()
  @IsNotEmpty()
  time: number;
}
