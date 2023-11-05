import {
  Controller,
  Post, UploadedFile, UseInterceptors
} from "@nestjs/common";
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('image')
export class AppController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }
}