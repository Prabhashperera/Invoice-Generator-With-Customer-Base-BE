import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: true,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
});