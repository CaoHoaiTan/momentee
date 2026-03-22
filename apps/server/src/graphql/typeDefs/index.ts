import { authTypeDefs } from './auth.graphql.js';
import { userTypeDefs } from './user.graphql.js';
import { coupleTypeDefs } from './couple.graphql.js';
import { milestoneTypeDefs } from './milestone.graphql.js';
import { postTypeDefs } from './post.graphql.js';

export const typeDefs = [userTypeDefs, authTypeDefs, coupleTypeDefs, milestoneTypeDefs, postTypeDefs];
