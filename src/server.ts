import 'dotenv/config'
import App from './app';
import Route from '@core/interfaces/routes.interface';
import { Router } from 'express';

const routes: Route[] = [ {
    path: "/users",
    router: Router()
}]
const app = new App(routes);

app.listen();