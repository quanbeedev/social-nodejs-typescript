import 'dotenv/config'
import App from './app';
import Route from '@core/interfaces/routes.interface';
import { Router } from 'express';
import AuthRoute from '@modules/auth/auth.route';
import { validateEnv } from '@core/utils';
import UsersRoute from '@modules/users/users.routes';



validateEnv();


const routes = [
    new AuthRoute(),
    new UsersRoute()
  ];
const app = new App(routes);

app.listen();