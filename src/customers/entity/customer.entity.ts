import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    cust_Name: string

    @Column()
    cust_Mobile: number

    @CreateDateColumn({type: 'timestamptz'})
    created_At: Date

}