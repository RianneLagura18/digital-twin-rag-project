import { handleChat } from "../services/aiService";

export default async function handler(req, res) {
  return handleChat(req, res);
}