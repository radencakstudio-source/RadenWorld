export type Gender = 'male' | 'female';
export type HatType = 'none' | 'adventurer' | 'knight' | 'bandana' | 'wizard' | 'crown';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type CharacterClass = 'warrior' | 'mage' | 'ranger' | 'cleric';
export type JumpVisualStage = 'none' | 'charge' | 'jump' | 'inAir' | 'landing';

export interface IAvatarCustomization {
  gender: Gender;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  hatType: HatType;
}

export interface IPlayerData {
  id: string;
  name: string;
  avatar: IAvatarCustomization;
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  hp: number;
  maxHp: number;
  level: number;
  role?: 'super_admin' | 'player' | string;
  isSuperAdmin?: boolean;
  gold?: number;
  diamonds?: number;
}

export interface IMonsterData {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  targetX?: number;
  targetY?: number;
}

export interface IChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderGender?: Gender;
  senderRole?: 'super_admin' | 'player' | string;
  isSuperAdmin?: boolean;
  text: string;
  timestamp: string;
  recipientName?: string;
  recipientId?: string;
  isPrivate?: boolean;
}

export interface IWorldInitData {
  selfId: string;
  selfPlayer: IPlayerData;
  players: IPlayerData[];
  monsters: IMonsterData[];
  worldBounds: { width: number; height: number };
}

export interface INpcConfig {
  id: string;
  name: string;
  role: string;
  avatarType: 'sage' | 'blacksmith' | 'alchemist' | 'merchant' | 'guard' | 'fisherman' | 'farmer' | 'elder';
  avatarUrl?: string;
  x: number;
  y: number;
  greeting: string;
  dialogues: string[];
  spriteKey: string;
}

