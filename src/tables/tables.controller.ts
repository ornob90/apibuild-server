/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('tables')
@UseGuards(AuthGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  async createTable(@Req() req: AuthenticatedRequest, @Body() createTableDto: CreateTableDto) {
    const userId = req.user.id;
    return this.tablesService.createTable(userId, createTableDto);
  }

  @Get('project/:projectId')
  async getTablesByProject(@Req() req: AuthenticatedRequest, @Param('projectId') projectId: string) {
    const userId = req.user.id;
    return this.tablesService.getTablesByProject(userId, projectId);
  }

  @Get(':tableId')
  async getTableById(@Req() req: AuthenticatedRequest, @Param('tableId') tableId: string) {
    const userId = req.user.id;
    return this.tablesService.getTableById(userId, tableId);
  }

  @Put(':tableId')
  async updateTable(
    @Req() req: AuthenticatedRequest,
    @Param('tableId') tableId: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    const userId = req.user.id;
    return this.tablesService.updateTable(userId, tableId, updateTableDto);
  }

  @Delete(':tableId')
  async deleteTable(@Req() req: AuthenticatedRequest, @Param('tableId') tableId: string) {
    const userId = req.user.id;
    await this.tablesService.deleteTable(userId, tableId);
    return { message: 'Table deleted successfully' };
  }
}