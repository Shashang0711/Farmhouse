import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { Photography } from '../photography/photography.entity';
import { Decoration } from '../decoration/decoration.entity';

@Entity()
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.farms, { eager: true })
  owner: User;

  @OneToMany(() => Photography, (photo) => photo.farm)
  photos: Photography[];

  @OneToMany(() => Decoration, (decoration) => decoration.farm)
  decorations: Decoration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

