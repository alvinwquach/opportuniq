/**
 * Decision Type Resolvers
 *
 * Field resolvers for Decision, DecisionOption, DecisionVote, and related types.
 */

import type {
  Decision as DecisionType,
  DecisionOption as DecisionOptionType,
  DecisionVote as DecisionVoteType,
  ProductRecommendation as ProductRecommendationType,
  VendorContact as VendorContactType,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";

export const Decision = {
  /**
   * The issue this decision is for
   */
  issue: async (decision: DecisionType, _: unknown, ctx: Context) => {
    return ctx.loaders.issueById.load(decision.issueId);
  },

  /**
   * The selected option
   */
  selectedOption: async (decision: DecisionType, _: unknown, ctx: Context) => {
    return ctx.loaders.optionById.load(decision.selectedOptionId);
  },

  /**
   * All votes on this decision
   */
  votes: async (decision: DecisionType, _: unknown, ctx: Context) => {
    return ctx.loaders.votesByDecisionId.load(decision.id);
  },

  /**
   * Total number of votes
   */
  voteCount: async (decision: DecisionType, _: unknown, ctx: Context) => {
    const votes = await ctx.loaders.votesByDecisionId.load(decision.id);
    return votes.length;
  },

  /**
   * Number of approval votes
   */
  approvalCount: async (decision: DecisionType, _: unknown, ctx: Context) => {
    const votes = await ctx.loaders.votesByDecisionId.load(decision.id);
    return votes.filter((v) => v.vote === "approve").length;
  },
};

export const DecisionOption = {
  /**
   * The issue this option belongs to
   */
  issue: async (option: DecisionOptionType, _: unknown, ctx: Context) => {
    return ctx.loaders.issueById.load(option.issueId);
  },

  /**
   * Product recommendations for this option
   */
  products: async (option: DecisionOptionType, _: unknown, ctx: Context) => {
    return ctx.loaders.productsByOptionId.load(option.id);
  },

  /**
   * Vendor recommendations for this option
   */
  vendors: async (option: DecisionOptionType, _: unknown, ctx: Context) => {
    return ctx.loaders.vendorsByOptionId.load(option.id);
  },

  /**
   * Cost min as string
   */
  costMin: (option: DecisionOptionType) => {
    return option.costMin?.toString() ?? null;
  },

  /**
   * Cost max as string
   */
  costMax: (option: DecisionOptionType) => {
    return option.costMax?.toString() ?? null;
  },

  /**
   * Required skills array
   */
  requiredSkills: (option: DecisionOptionType) => {
    return option.requiredSkills ?? null;
  },

  /**
   * Required tools array
   */
  requiredTools: (option: DecisionOptionType) => {
    return option.requiredTools ?? null;
  },

  /**
   * Required parts array
   */
  requiredParts: (option: DecisionOptionType) => {
    return option.requiredParts ?? null;
  },

  /**
   * PPE requirements array
   */
  ppe: (option: DecisionOptionType) => {
    return option.ppe ?? null;
  },

  /**
   * Critical safety items
   */
  doNotProceedWithout: (option: DecisionOptionType) => {
    return option.doNotProceedWithout ?? null;
  },

  /**
   * Hazards array
   */
  hazards: (option: DecisionOptionType) => {
    return option.hazards ?? null;
  },
};

export const DecisionVote = {
  /**
   * Member who cast this vote
   */
  member: async (vote: DecisionVoteType, _: unknown, ctx: Context) => {
    return ctx.loaders.memberById.load(vote.memberId);
  },
};

export const ProductRecommendation = {
  /**
   * Estimated cost as string
   */
  estimatedCost: (product: ProductRecommendationType) => {
    return product.estimatedCost?.toString() ?? null;
  },
};

export const VendorContact = {
  /**
   * Quote amount as string
   */
  quoteAmount: (vendor: VendorContactType) => {
    return vendor.quoteAmount?.toString() ?? null;
  },

  /**
   * Specialties array
   */
  specialties: (vendor: VendorContactType) => {
    return vendor.specialties ?? null;
  },
};
