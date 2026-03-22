import { authTypeDefs } from './auth.graphql.js';
import { userTypeDefs } from './user.graphql.js';
import { coupleTypeDefs } from './couple.graphql.js';
import { milestoneTypeDefs } from './milestone.graphql.js';
import { postTypeDefs } from './post.graphql.js';
import { wishTypeDefs } from './wish.graphql.js';
import { reactionTypeDefs } from './reaction.graphql.js';
import { eventTypeDefs } from './event.graphql.js';
import { quizTypeDefs } from './quiz.graphql.js';
import { giftTypeDefs } from './gift.graphql.js';
import { notificationTypeDefs } from './notification.graphql.js';
import { billingTypeDefs } from './billing.graphql.js';
import { exploreTypeDefs } from './explore.graphql.js';
import { adminTypeDefs } from './admin.graphql.js';

export const typeDefs = [userTypeDefs, authTypeDefs, coupleTypeDefs, milestoneTypeDefs, postTypeDefs, wishTypeDefs, reactionTypeDefs, eventTypeDefs, quizTypeDefs, giftTypeDefs, notificationTypeDefs, billingTypeDefs, exploreTypeDefs, adminTypeDefs];
