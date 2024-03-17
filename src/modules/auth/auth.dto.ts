import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export default class LoginDto{

    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;


    constructor(email: string, password: string){
        this.email = email;
        this.password = password
    }
}