import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create - service', () => {
    it('crée un utilisateur avec succès - 201', async () => {
      const createUserDto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
      };
      
      const userEntity = {
        id: 1,
        ...createUserDto,
      };

      mockRepository.create.mockReturnValue(userEntity);
      mockRepository.save.mockResolvedValue(userEntity);

      const result = await service.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(userEntity);
      expect(result).toEqual(userEntity);
    });

    it("propage l'erreur de la base de données - 500", async () => {
      const createUserDto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
      };

      mockRepository.create.mockReturnValue(createUserDto);
      mockRepository.save.mockRejectedValue(
        new Error('Database error')
      );

      await expect(service.create(createUserDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll - service', () => {
    it("retourne un tableau d'utilisateurs - 200", async () => {
      const expectedUsers = [
        { id: 1, firstname: 'John', lastname: 'Doe' },
        { id: 2, firstname: 'Jane', lastname: 'Smith' },
      ];

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne - service', () => {
    it('retourne un utilisateur par ID - 200', async () => {
      const userId = 1;
      const expectedUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(expectedUser);
    });

    it("lance une erreur si l'utilisateur n'existe pas - 404", async () => {
      const userId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(`User with ID ${userId} not found`);
    });
  });

  describe('update - service', () => {
    it('met à jour un utilisateur avec succès - 200', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstname: 'John Updated',
      };
      
      const existingUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingUser,
        ...updateUserDto,
      });
      expect(result).toEqual(updatedUser);
    });

    it("lance une erreur si l'utilisateur n'existe pas - 404", async () => {
      const userId = 999;
      const updateUserDto: UpdateUserDto = {
        firstname: 'John Updated',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(`User with ID ${userId} not found`);
    });
  });


  describe('remove - service', () => {
    it('supprime un utilisateur avec succès - 200', async () => {
      const userId = 1;

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(userId);

      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
    });

    it("lance une erreur si l'utilisateur n'existe pas - 404", async () => {
      const userId = 999;

      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(userId)).rejects.toThrow(`User with ID ${userId} not found`);
    });
  });
});

   