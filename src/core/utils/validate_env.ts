import { cleanEnv, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    MONGOBD_URI: str(),
  });
};

export default validateEnv;
