export interface IUserChatProfileDto {
  _id: string;
  name: string;
  isAI: boolean;
  avatar?: string;
}

export interface IUserChatDto {
  chatId: string;
  profiles: IUserChatProfileDto[]
}

export interface IUserChatMessageDto {
  message: string;
  sender: string;
  createdAt?: Date;
  updatedAt?: Date;
}
