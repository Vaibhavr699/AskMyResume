import { Injectable } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

@Injectable()
export class VectorDbService {
  private client: ChromaClient;
  private collection: any;

  constructor() {
    this.client = new ChromaClient({ path: process.env.CHROMA_DB_URL || 'http://localhost:8000' });
    this.init();
  }

  async init() {
    try {
      this.collection = await this.client.getCollection({ name: 'resumes_and_jobs' });
    } catch {
      this.collection = await this.client.createCollection({ name: 'resumes_and_jobs' });
    }
  }

  async addDocument(id: string, text: string, embedding: number[], type: 'resume' | 'job') {
    await this.collection.add({
      ids: [id],
      documents: [text],
      embeddings: [embedding],
      metadatas: [{ type }],
    });
  }

  async query(embedding: number[], type: 'resume' | 'job', n = 5) {
    return await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: n,
      where: { type },
    });
  }
} 