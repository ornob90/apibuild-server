import { Test, TestingModule } from '@nestjs/testing';
import { ApiBuildController } from './api-build.controller';

describe('ApiBuildController', () => {
  let controller: ApiBuildController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiBuildController],
    }).compile();

    controller = module.get<ApiBuildController>(ApiBuildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
