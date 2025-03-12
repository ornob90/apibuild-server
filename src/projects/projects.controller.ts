/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  // UseGuards,
} from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthenticateRequest } from 'src/types/auth.types';

@Controller('projects')
// @UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Req() req: AuthenticateRequest,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    const userId = req.user.id; // Assumes JWT payload has 'id'
    return this.projectsService.createProject(userId, createProjectDto);
  }

  @Get()
  async getUserProjects(@Req() req: AuthenticateRequest) {
    const userId = req.user.id;
    return this.projectsService.getUserProjects(userId);
  }

  @Get(':projectId')
  async getProjectById(
    @Req() req: AuthenticateRequest,
    @Param('projectId') projectId: string,
  ) {
    const userId = req.user.id;
    return this.projectsService.getProjectById(userId, projectId);
  }

  @Put(':projectId')
  async updateProject(
    @Req() req: AuthenticateRequest,
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const userId = req.user.id;
    return this.projectsService.updateProject(
      userId,
      projectId,
      updateProjectDto,
    );
  }

  @Delete(':projectId')
  async deleteProject(
    @Req() req: AuthenticateRequest,
    @Param('projectId') projectId: string,
  ) {
    const userId = req.user.id;
    await this.projectsService.deleteProject(userId, projectId);
    return { message: 'Project deleted successfully' };
  }
}
