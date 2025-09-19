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

// Method to add referral
referralSchema.methods.addReferral = function (status = "PENDING") {
  this.totalReferrals += 1;
  this.lastReferralDate = new Date();

  if (status === "PENDING") {
    this.pendingReferrals += 1;
  } else if (status === "SUCCESSFUL") {
    this.successfulReferrals += 1;
    this.totalEarnings += 500; // ₹500 per successful referral
  }

  return this.save();
};

// Method to update referral status
referralSchema.methods.updateReferralStatus = function (oldStatus, newStatus) {
  if (oldStatus === "PENDING" && newStatus === "SUCCESSFUL") {
    this.pendingReferrals -= 1;
    this.successfulReferrals += 1;
    this.totalEarnings += 500;
  } else if (oldStatus === "PENDING" && newStatus === "FAILED") {
    this.pendingReferrals -= 1;
  }

  return this.save();
};

module.exports = mongoose.model("Referral", referralSchema);
