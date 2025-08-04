export default () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    database: {
      url: process.env.DATABASE_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    },
    upload: {
      dir: process.env.UPLOAD_DIR || './uploads',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    chroma: {
      url: process.env.CHROMA_DB_URL || 'http://localhost:8000',
    },
  });