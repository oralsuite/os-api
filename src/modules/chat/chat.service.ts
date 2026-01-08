import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from './entities';
import { CreateConversationDto, SendMessageDto } from './dto';
import { User } from '../users/entities';
import { UserRole } from '../../common/enums';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async createConversation(user: User, dto: CreateConversationDto): Promise<Conversation> {
    const whereCondition: any = {
      dentistId: user.id,
      laboratoryId: dto.laboratoryId,
    };
    if (dto.orderId) {
      whereCondition.orderId = dto.orderId;
    }

    const existing = await this.conversationsRepository.findOne({
      where: whereCondition,
    });

    if (existing) {
      return existing;
    }

    const conversation = this.conversationsRepository.create({
      dentistId: user.id,
      laboratoryId: dto.laboratoryId,
      orderId: dto.orderId,
    });

    return this.conversationsRepository.save(conversation);
  }

  async findAllConversations(user: User): Promise<Conversation[]> {
    const where: any[] = [{ dentistId: user.id }, { laboratoryId: user.id }];

    return this.conversationsRepository.find({
      where,
      relations: ['dentist', 'laboratory', 'order'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async findConversation(id: string, user: User): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: ['dentist', 'laboratory', 'order'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.dentistId !== user.id && conversation.laboratoryId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async getMessages(conversationId: string, user: User, limit = 50, offset = 0): Promise<Message[]> {
    await this.findConversation(conversationId, user);

    return this.messagesRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async sendMessage(user: User, dto: SendMessageDto): Promise<Message> {
    await this.findConversation(dto.conversationId, user);

    const message = this.messagesRepository.create({
      conversationId: dto.conversationId,
      senderId: user.id,
      content: dto.content,
    });

    await this.messagesRepository.save(message);

    await this.conversationsRepository.update(dto.conversationId, {
      lastMessageAt: new Date(),
    });

    const savedMessage = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });

    return savedMessage!;
  }

  async markAsRead(conversationId: string, user: User): Promise<void> {
    await this.findConversation(conversationId, user);

    await this.messagesRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: true, readAt: new Date() })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId: user.id })
      .andWhere('is_read = false')
      .execute();
  }
}
