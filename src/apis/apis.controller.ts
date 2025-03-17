/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Put, Delete, Body, Param, Req, ParseIntPipe, Query } from '@nestjs/common';
import { ApisService } from './apis.service';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { AuthenticateRequest } from 'src/types/auth.types';


@Controller('apis')
export class ApisController {
  constructor(private readonly apisService: ApisService) {}

  @Post()
  async createApi(@Req() req: AuthenticateRequest, @Body() createApiDto: CreateApiDto) {
    const userId = req.user.id;
    // console.log(userId)
    return this.apisService.createApi(userId, createApiDto);
  }

  @Get()
async getUserApis(
  @Req() req: AuthenticateRequest,
  @Query('page', ParseIntPipe) page: number = 1,
  @Query('limit', ParseIntPipe) limit: number = 10,
) {
  const userId = req.user.id;
  return this.apisService.getUserApis(userId, page, limit);
}

  @Get(':apiId')
  async getApiById(@Req() req: AuthenticateRequest, @Param('apiId') apiId: string) {
    const userId = req.user.id;
    return this.apisService.getApiById(userId, apiId);
  }

  @Put(':apiId')
  async updateApi(
    @Req() req: AuthenticateRequest,
    @Param('apiId') apiId: string,
    @Body() updateApiDto: UpdateApiDto,
  ) {
    const userId = req.user.id;
    return this.apisService.updateApi(userId, apiId, updateApiDto);
  }

  @Delete(':apiId')
  async deleteApi(@Req() req: AuthenticateRequest, @Param('apiId') apiId: string) {
    const userId = req.user.id;
    await this.apisService.deleteApi(userId, apiId);
    return { message: 'API deleted successfully' };
  }
}