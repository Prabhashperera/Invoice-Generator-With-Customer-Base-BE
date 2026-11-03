import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    cust_Name: string

    @Column()
    cust_Mobile: number

}