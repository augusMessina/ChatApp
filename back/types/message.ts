export type Message = {
  id: string;
  author: string;
  timestamp: number;
  message: { language: string; content: string }[];
};
