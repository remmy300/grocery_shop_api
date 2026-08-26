import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("NEWSLETTER SUBSCRIBE ERROR:", error);
    return res.status(500).json({ message: "Failed to subscribe" });
  }
};

export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    return res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("CONTACT MESSAGE ERROR:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};
