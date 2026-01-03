import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  // CREATE
  describe('create - controller', () => {
    it('crée un utilisateur avec succès - 201', async () => {
      const createUserDto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
      };
      
      const expectedUser = {
        id: 1,
        ...createUserDto,
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await usersController.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it("gère l'erreur lors de la création - 500", async () => {
      const createUserDto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Erreur de création')
      );

      await expect(usersController.create(createUserDto)).rejects.toThrow('Erreur de création');
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  // FIND ALL (déjà présent)
  describe('findAll - controller', () => {
    it("retourne un tableau d'utilisateurs - 200", async () => {
      const expectedUsers = [
        { id: 1, firstname: 'John', lastname: 'Doe' },
        { id: 2, firstname: 'Jane', lastname: 'Smith' },
      ];

      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await usersController.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });

    it("gère l'erreur si le service échoue - 500", async () => {
      mockUsersService.findAll.mockRejectedValue(
        new Error('Database unavailable')
      );

      await expect(usersController.findAll()).rejects.toThrow('Database unavailable');
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  // FIND ONE
  describe('findOne - controller', () => {
    it('retourne un utilisateur par ID - 200', async () => {
      const userId = '1';
      const expectedUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
      };

      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await usersController.findOne(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedUser);
    });

    it("gère l'erreur si l'utilisateur n'existe pas - 404", async () => {
      const userId = '999';

      mockUsersService.findOne.mockRejectedValue(
        new Error('Utilisateur non trouvé')
      );

      await expect(usersController.findOne(userId)).rejects.toThrow('Utilisateur non trouvé');
      expect(usersService.findOne).toHaveBeenCalledWith(999);
    });
  });

  // UPDATE
  describe('update - controller', () => {
    it('met à jour un utilisateur avec succès - 200', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        firstname: 'John Updated',
      };
      
      const updatedUser = {
        id: 1,
        firstname: 'John Updated',
        lastname: 'Doe',
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await usersController.update(userId, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it("gère l'erreur lors de la mise à jour - 500", async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        firstname: 'John Updated',
      };

      mockUsersService.update.mockRejectedValue(
        new Error('Erreur de mise à jour')
      );

      await expect(usersController.update(userId, updateUserDto)).rejects.toThrow('Erreur de mise à jour');
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove - controller', () => {
    it('supprime un utilisateur avec succès - 200', async () => {
      const userId = '1';
      
      mockUsersService.remove.mockResolvedValue({ message: 'Utilisateur supprimé' });

      const result = await usersController.remove(userId);

      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Utilisateur supprimé' });
    });

    it("gère l'erreur lors de la suppression - 500", async () => {
      const userId = '1';

      mockUsersService.remove.mockRejectedValue(
        new Error('Erreur de suppression')
      );

      await expect(usersController.remove(userId)).rejects.toThrow('Erreur de suppression');
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });
});