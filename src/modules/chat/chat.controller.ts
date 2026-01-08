import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create or get existing conversation' })
  createConversation(@CurrentUser() user: User, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(user, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List all conversations' })
  findAllConversations(@CurrentUser() user: User) {
    return this.chatService.findAllConversations(user);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  findConversation(@Param('id') id: string, @CurrentUser() user: User) {
    return this.chatService.findConversation(id, user);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getMessages(id, user, limit || 50, offset || 0);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(@CurrentUser() user: User, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(user, dto);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.chatService.markAsRead(id, user);
  }
}
