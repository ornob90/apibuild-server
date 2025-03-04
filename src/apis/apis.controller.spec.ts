import { Test, TestingModule } from '@nestjs/testing';
import { ApisController } from './apis.controller';

describe('ApisController', () => {
  let controller: ApisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApisController],
    }).compile();

    controller = module.get<ApisController>(ApisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
