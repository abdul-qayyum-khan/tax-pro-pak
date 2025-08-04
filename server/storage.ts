import { type User, type InsertUser, type Client, type InsertClient, type Task, type InsertTask } from "@shared/schema";
import { randomUUID } from "crypto";
import { encryptCredentials, decryptCredentials } from "./encryption";
import { hashPassword } from "./auth";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTasksByClient(clientId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Stats
  getStats(): Promise<{
    totalClients: number;
    tasksDueThisWeek: number;
    overdueTasks: number;
    completedThisMonth: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clients: Map<string, Client>;
  private tasks: Map<string, Task>;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.tasks = new Map();
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    // Create default admin user if no users exist
    if (this.users.size === 0) {
      const hashedPassword = await hashPassword("admin123");
      const adminUser: User = {
        id: randomUUID(),
        username: "admin",
        password: hashedPassword,
        name: "Tax Consultant Admin",
        createdAt: new Date()
      };
      this.users.set(adminUser.id, adminUser);
      console.log("✓ Default admin user created - Username: admin, Password: admin123");
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getClients(): Promise<Client[]> {
    const clients = Array.from(this.clients.values());
    return clients.map(client => ({
      ...client,
      portalCredentials: decryptCredentials(client.portalCredentials)
    }));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    return {
      ...client,
      portalCredentials: decryptCredentials(client.portalCredentials)
    };
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const now = new Date();
    const client: Client = {
      ...insertClient,
      id,
      portalCredentials: encryptCredentials(insertClient.portalCredentials),
      createdAt: now,
      updatedAt: now,
    };
    this.clients.set(id, client);
    return {
      ...client,
      portalCredentials: decryptCredentials(client.portalCredentials)
    };
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;

    const updated: Client = {
      ...existing,
      ...updateData,
      portalCredentials: updateData.portalCredentials 
        ? encryptCredentials(updateData.portalCredentials)
        : existing.portalCredentials,
      updatedAt: new Date(),
    };
    this.clients.set(id, updated);
    return {
      ...updated,
      portalCredentials: decryptCredentials(updated.portalCredentials)
    };
  }

  async deleteClient(id: string): Promise<boolean> {
    const deleted = this.clients.delete(id);
    // Also delete related tasks
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.clientId === id) {
        this.tasks.delete(taskId);
      }
    }
    return deleted;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByClient(clientId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.clientId === clientId);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: now,
      updatedAt: now,
      fileUrls: insertTask.fileUrls || [],
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updated: Task = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getStats(): Promise<{
    totalClients: number;
    tasksDueThisWeek: number;
    overdueTasks: number;
    completedThisMonth: number;
  }> {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const tasks = Array.from(this.tasks.values());

    const tasksDueThisWeek = tasks.filter(task => 
      task.deadline && 
      task.deadline <= weekFromNow && 
      task.deadline >= now &&
      task.status !== 'completed'
    ).length;

    const overdueTasks = tasks.filter(task => 
      task.deadline && 
      task.deadline < now &&
      task.status !== 'completed'
    ).length;

    const completedThisMonth = tasks.filter(task => 
      task.status === 'completed' &&
      task.updatedAt >= monthStart
    ).length;

    return {
      totalClients: this.clients.size,
      tasksDueThisWeek,
      overdueTasks,
      completedThisMonth,
    };
  }
}

export const storage = new MemStorage();
