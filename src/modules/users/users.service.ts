import { generateJwtToken, randomTokenString } from "@core/utils/helpers";

import { HttpException } from "@core/exceptions";
import { IPagination } from "@core/interfaces";
import IUser from "./users.interface";
import { RefreshTokenSchema } from "@modules/refresh_token";
import { TokenData } from "@core/interfaces";
import UserSchema from './users.model';
import bcryptjs from 'bcryptjs';
import gravatar from 'gravatar';
import { isEmtyObject } from '@core/utils';
import RegisterDto from "./dtos/register.dto";

class UserService{
    public userSchema = UserSchema;

    public async createUser(model: RegisterDto): Promise<TokenData>{
        if( isEmtyObject(model)){
            throw new HttpException(400, "Model is empty")
        }

        const user = await this.userSchema.findOne({email: model.email}).exec();
        if( user ){
            throw new HttpException(400, `Your email ${model.email} already exist.`);
        }

        const avatar = gravatar.url(model.email,{
            size: '200',
            rating: 'g',
            default: 'mm'
        });

        const salt = await bcryptjs.genSalt(10);

        const hashedPassword = await bcryptjs.hash(model.password, salt);
        const createUser = await this.userSchema.create({
            ...model,
            password: hashedPassword,
            avatar: avatar,
            date: Date.now()
        })

        const refreshToken = await this.genarateRefreshToken(createUser._id);
        await refreshToken.save();

        return generateJwtToken(createUser._id , refreshToken.token)
    }

    public async updateUser(userId: string, model: RegisterDto): Promise<void>{
        if( isEmtyObject(model) ){
            throw new HttpException(400, "Model is empty");
        }

        const user = await this.userSchema.findById(userId).exec();
        if(!user){
            throw new HttpException(400, "User id is not exist");
        }

        let avatar = user.avatar;
        
        const checkExistEmail = await this.userSchema.find({
            $and: [{email: { $eq: model.email}} , {_id:{$ne: userId}}]
        })
        .exec();

        if( checkExistEmail.length !== 0 )
         throw new HttpException(400, "Your Email has been use by another user");

         avatar = gravatar.url(model.email!, {
            size: '200',
            rating: 'g',
            default: 'mm',
          });

        let updateUserById: any;
        if (model.password) {
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(model.password, salt);
            updateUserById = await this.userSchema
              .findByIdAndUpdate(
                userId,
                {
                  ...model,
                  avatar: avatar,
                  password: hashedPassword,
                },
                { new: true },
              )
              .exec();
          } else {
            updateUserById = await this.userSchema
              .findByIdAndUpdate(
                userId,
                {
                  ...model,
                  avatar: avatar,
                },
                { new: true },
              )
              .exec();
          }
      
          if (!updateUserById) throw new HttpException(409, 'You are not an user');
      
          return updateUserById;
        
    }

    public async getUserById(userId: string): Promise<IUser> {
        const user = await this.userSchema.findById(userId).exec();
        if (!user) {
          throw new HttpException(404, `User is not exists`);
        }
        return user;
      }
    
    public async getAll(): Promise<IUser[]> {
        const users = await this.userSchema.find().exec();
        return users;
    }


    public async getAllPaging(keyword: string, page:  number): Promise<IPagination<IUser>> {
        const pageSize = Number(process.env.PAGE_SIZE || 10);
        let query = {};

        if( keyword ){
            query = {
                $or: [{email: keyword}, {first_name: keyword}, {last_name: keyword}]
            }
        }
        
        const users = await this.userSchema
        .find(query)
        .skip((page -1 ) * pageSize)
        .limit(pageSize)
        .exec() 
        
        const rowCount = await this.userSchema.find(query).countDocuments().exec();

        return {
            total: rowCount,
            page: page,
            pageSize: pageSize,
            items: users
        } as IPagination<IUser>
    }

    public async deleteUser(userId: string): Promise<IUser> {
        const deletedUser = await this.userSchema.findByIdAndDelete(userId).exec();
        if (!deletedUser) throw new HttpException(409, 'Your id is invalid');
        return deletedUser;
      }
    
      public async deleteUsers(userIds: string[]): Promise<number | undefined> {
        const result: any = await this.userSchema.deleteMany({ _id: [...userIds] }).exec();
        if (!result.ok) throw new HttpException(409, 'Your id is invalid');
        return result.deletedCount;
      }

    private async genarateRefreshToken(userId: string){
        return new RefreshTokenSchema({
            user: userId,
            token: randomTokenString(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
    }

}


export default UserService;