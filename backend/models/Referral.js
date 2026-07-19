const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    successfulReferrals: {
      type: Number,
      default: 0,
    },
    pendingReferrals: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastReferralDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// referralCode and studentId already have unique indexes via field definitions above
referralSchema.index({ totalEarnings: -1 });

// Virtual for referral link
referralSchema.virtual("referralLink").get(function () {
  return `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/register?ref=${this.referralCode}`;
});

// Helper to calculate total earnings based on tiers
referralSchema.methods.calculateEarnings = async function () {
  const WebsiteSettings = mongoose.model('WebsiteSettings');
  const settings = await WebsiteSettings.findOne();
  
  if (!settings || !settings.referralSettings || !settings.referralSettings.tiers) {
    // Default fallback if settings are missing
    this.totalEarnings = this.successfulReferrals * 2000;
    return;
  }

  const tiers = settings.referralSettings.tiers;
  let currentTierAmount = 0;

  for (const tier of tiers) {
    if (this.successfulReferrals >= tier.minReferrals && (tier.maxReferrals === null || this.successfulReferrals <= tier.maxReferrals)) {
      currentTierAmount = tier.amount;
      break;
    }
  }

  // If we couldn't find a tier (e.g. 0 referrals), amount is 0
  if (this.successfulReferrals === 0) currentTierAmount = 0;
  // If no matching tier found but referrals > 0, fallback to lowest tier
  else if (currentTierAmount === 0 && tiers.length > 0) currentTierAmount = tiers[0].amount;

  this.totalEarnings = this.successfulReferrals * currentTierAmount;
};

// Method to add referral
referralSchema.methods.addReferral = async function (status = "PENDING") {
  this.totalReferrals += 1;
  this.lastReferralDate = new Date();

  if (status === "PENDING") {
    this.pendingReferrals += 1;
  } else if (status === "SUCCESSFUL") {
    this.successfulReferrals += 1;
    await this.calculateEarnings();
  }

  return this.save();
};

// Method to update referral status
referralSchema.methods.updateReferralStatus = async function (oldStatus, newStatus) {
  if (oldStatus === "PENDING" && newStatus === "SUCCESSFUL") {
    this.pendingReferrals -= 1;
    this.successfulReferrals += 1;
    await this.calculateEarnings();
  } else if (oldStatus === "PENDING" && newStatus === "FAILED") {
    this.pendingReferrals -= 1;
  }

  return this.save();
};

module.exports = mongoose.model("Referral", referralSchema);
