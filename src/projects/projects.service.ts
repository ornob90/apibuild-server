/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Table, TableDocument } from 'src/schemas/table.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectConnection() private connection: Connection,
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
    all?: 'true' | 'false',
  ): Promise<{
    projects: { _id: string; projectName: string }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNumber = Math.max(1, page);
    const itemsPerPage = Math.max(1, Math.min(100, limit)); // Cap limit at 100

    const skip = (pageNumber - 1) * itemsPerPage;

    if (all && all === 'true') {
      const projects = await this.projectModel.find({ userId });
      const formattedProjects = projects.map((project) => ({
        _id: project._id,
        projectName: project.projectName,
      }));

      return {
        projects: formattedProjects,
        total: projects?.length,
        page: 0,
        limit: 0,
        totalPages: 0,
      };
    }

    // Fetch paginated projects
    const projects = await this.projectModel
      .find({ userId })
      .skip(skip)
      .limit(itemsPerPage)
      .exec();

    // Get total count of projects for this user
    const total = await this.projectModel
      .estimatedDocumentCount({ userId })
      .exec();

    // Map projects to desired format
    const formattedProjects = projects.map((project) => ({
      _id: project._id.toString(),
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
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }

    const projectResult = await this.projectModel
      .deleteOne({ _id: projectId, userId })
      .exec();
    if (projectResult.deletedCount === 0) {
      throw new NotFoundException('Project not found');
    }

    const tables = await this.tableModel.find({ userId, projectId }).exec();

    if (tables.length > 0) {
      await this.tableModel.deleteMany({ userId, projectId }).exec();

      for (const table of tables) {
        const collectionName = `${userId}_${projectId}_${table.tableName}`;
        try {
          await this.connection.db.dropCollection(collectionName);
        } catch {}
      }
    }
  }
}
