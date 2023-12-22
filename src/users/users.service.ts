import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadUserDto } from './dto/read-user.dto';
import { DeleteUserDto } from './dto/delete-user-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findAll(): Promise<ReadUserDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => ({
      username: user.username,
      birthdate: user.birthdate,
    }));
  }

  async findOne(id: number): Promise<ReadUserDto> {
    const user = await this.userRepository.findOneBy({ id: id });
    return {
      username: user.username,
      birthdate: user.birthdate,
    };
  }

  async findOneByName(username: string) {
    return await this.userRepository.findOneBy({ username });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id: updateUserDto.id });
    if (await bcrypt.compare(updateUserDto.oldPassword, user.password)) {
      user.username = updateUserDto.username;
      await this.userRepository.save(user);
    }
  }

  async remove(deleteUserDto: DeleteUserDto) {
    const user = await this.userRepository.findOneBy({ id: deleteUserDto.id });
    if (await bcrypt.compare(deleteUserDto.password, user.password)) {
      await this.userRepository.delete(user);
    }
  }
}
