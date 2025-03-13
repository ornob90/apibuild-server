/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async createProject(
    userId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<{ projectId: string }> {
    const { projectName } = createProjectDto;

    // Check for duplicate project name for this user
    const existingProject = await this.projectModel.findOne({
      userId,
      projectName,
    });
    if (existingProject) {
      throw new BadRequestException(
        `Project '${projectName}' already exists for this user`,
      );
    }

    // Create new project
    const project = new this.projectModel({ userId, projectName });
    await project.save();

    return { projectId: project._id.toString() };
  }

  async getUserProjects(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    projects: { projectId: string; projectName: string }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNumber = Math.max(1, page);
    const itemsPerPage = Math.max(1, Math.min(100, limit)); // Cap limit at 100

    const skip = (pageNumber - 1) * itemsPerPage;

    // Fetch paginated projects
    const projects = await this.projectModel
      .find({ userId })
      .skip(skip)
      .limit(itemsPerPage)
      .exec();

    // Get total count of projects for this user
    const total = await this.projectModel.estimatedDocumentCount({ userId }).exec();

    // Map projects to desired format
    const formattedProjects = projects.map((project) => ({
      projectId: project._id.toString(),
      projectName: project.projectName,
    }));

    return {
      projects: formattedProjects,
      total,
      page: pageNumber,
      limit: itemsPerPage,
      totalPages: Math.ceil(total / itemsPerPage),
    };
  }

  async getProjectById(
    userId: string,
    projectId: string,
  ): Promise<{ projectId: string; projectName: string }> {
    const project = await this.projectModel
      .findOne({ _id: projectId, userId })
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found or not owned by user');
    }
    return {
      projectId: project._id.toString(),
      projectName: project.projectName,
    };
  }

  async updateProject(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<{ projectId: string }> {
    const { projectName } = updateProjectDto;

    // Check if project exists and belongs to user
    const project = await this.projectModel
      .findOne({ _id: projectId, userId })
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found or not owned by user');
    }

    // Check for duplicate project name
    const duplicate = await this.projectModel.findOne({
      userId,
      projectName,
      _id: { $ne: projectId },
    });
    if (duplicate) {
      throw new BadRequestException(
        `Project '${projectName}' already exists for this user`,
      );
    }

    project.projectName = projectName;
    await project.save();

    return { projectId: project._id.toString() };
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const result = await this.projectModel
      .deleteOne({ _id: projectId, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Project not found or not owned by user');
    }
  }
}
