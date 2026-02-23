const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "Transfer", "Bill Payment", "Deposit"],
      required: true,
    },

    billerName: {
      type: String,
    },

    category: {
      type: String,
      default: "General",
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        // يكون المستلم إجبارياً (true) فقط إذا كان نوع العملية "Transfer"
        return this.type === "Transfer";
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
