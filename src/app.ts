import express from 'express';
import http from 'http';
import Logger from '@core/utils/logger';
import mongoose from 'mongoose';
import Route from '@core/interfaces/routes.interface';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';


class App {
    // Port to listen for requests from clients
    public port: string | number;

    // The environment the server will be running in
    public production: boolean;

    // Represents the Express application
    public app: express.Application;

    public server: http.Server;

    constructor(routes: Route[]) {
        console.log("this is constructor")
        this.app = express();
        this.server = http.createServer(this.app);

        this.production = process.env.NODE_ENV === 'production' ? true : false;
        this.port = process.env.PORT || 15000;

        this.connectToDatabase();
        this.initializeRoutes(routes);
        this.initializeSwagger();

    }

    public listen() {
        console.log("this is listen")
        this.server.listen(this.port , () => {
            Logger.info(`Server is listening on port ${this.port}`);
        })
    }

    private initializeRoutes(routes: Route[]) {
        routes.forEach((route) => {
          this.app.use('/', route.router);
        });
      }

    private connectToDatabase(){

        console.log("this is auto vaue ")
        const connectionString = process.env.MONGOBD_URI;
        if( !connectionString ){
            Logger.error('Connection string is invalid');
            return;
        }
        mongoose
        .connect(connectionString, {
            dbName: process.env.DATABASE_NAME,
            user: process.env.DATABASE_PASSWORD,
            autoIndex: true,
        })
        .catch((reason) => {
          Logger.error(reason);
        });
      Logger.info('Database connected...');
    }


  private initializeSwagger() {
    const swaggerDocument = YAML.load('./src/swagger.yaml');

    this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }


}

export default App;