import mongoose from "mongoose";

/**
 * TODO: Define Todo schema
 *
 * Fields:
 * - title: String, required, trim, min 3, max 120 chars
 * - completed: Boolean, default false
 * - priority: Enum ["low", "medium", "high"], default "medium"
 * - tags: Array of Strings, max 10 items, default []
 * - dueDate: Date, optional
 *
 * Options:
 * - Enable timestamps
 * - Add index: { completed: 1, createdAt: -1 }
 */

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 120,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length < 10;
        },
        message: "Only 10 items can be inserted",
      },
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// TODO: Add index
todoSchema.index({ title: 1 });
todoSchema.index({ createdAt: -1 });

// TODO: Create and export the Todo model
const Todo = mongoose.model("todo", todoSchema);
export { Todo };
