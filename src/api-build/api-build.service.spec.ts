import { Test, TestingModule } from '@nestjs/testing';
import { ApiBuildService } from './api-build.service';

describe('ApiBuildService', () => {
  let service: ApiBuildService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiBuildService],
    }).compile();

    service = module.get<ApiBuildService>(ApiBuildService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
