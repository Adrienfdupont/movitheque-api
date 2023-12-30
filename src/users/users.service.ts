import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    const user = await this.userRepository.findOneBy({ id: id });
    if (!(await bcrypt.compare(updateUserDto.password, user.password))) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    user.username = updateUserDto.username
      ? updateUserDto.username
      : user.username;
    if (
      updateUserDto.newPassword &&
      !(await bcrypt.compare(updateUserDto.newPassword, user.password))
    ) {
      user.password = await bcrypt.hash(updateUserDto.newPassword, 10);
    }
    await this.userRepository.save(user);
  }

  async remove(id: number, deleteUserDto: DeleteUserDto) {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!(await bcrypt.compare(deleteUserDto.password, user.password))) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.userRepository.delete(user);
  }
}
