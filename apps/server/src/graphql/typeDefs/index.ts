import { authTypeDefs } from './auth.graphql.js';
import { userTypeDefs } from './user.graphql.js';
import { coupleTypeDefs } from './couple.graphql.js';

export const typeDefs = [userTypeDefs, authTypeDefs, coupleTypeDefs];
