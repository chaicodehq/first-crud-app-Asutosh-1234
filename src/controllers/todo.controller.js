import { Todo } from "../models/todo.model.js";

/**
 * TODO: Create a new todo
 * - Extract data from req.body
 * - Create todo in database
 * - Return 201 with created todo
 */
export async function createTodo(req, res, next) {
  try {
    const { title, completed, priority, tags, dueDate } = req.body;

    const validPriority = ["low", "medium", "high"];
    if (!title)
      return res.status(400).json({
        error: { message: "title is required" },
      });
    if (title.length < 3)
      return res.status(400).json({
        error: { message: "title must be atleast 3 character" },
      });
    if (title.length > 120)
      return res.status(400).json({
        error: { message: "title must be at most 120 characters" },
      });
    const trimmedTitle = title.trim();

    if (tags && !Array.isArray(tags))
      return res.status(400).json({
        error: { message: "tags must be an array" },
      });
    if (priority && !validPriority.includes(priority))
      return res.status(400).json({
        error: { message: "Invalid priority provided" },
      });
    const todo = await Todo.create({
      title: trimmedTitle,
      completed,
      priority,
      tags,
      dueDate,
    });
    return res.status(201).json(todo.toObject());
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: List todos with pagination and filters
 * - Support query params: page, limit, completed, priority, search
 * - Default: page=1, limit=10
 * - Return: { data: [...], meta: { total, page, limit, pages } }
 */
export async function listTodos(req, res, next) {
  try {
    req.query.page = req.query.page ? Number(req.query.page) : 1;
    req.query.limit = req.query.limit ? Number(req.query.limit) : 10;

    const { page, limit, completed, priority, search } = req.query;

    const filter = {};

    if (completed !== undefined) filter.completed = completed === "true";

    if (priority) filter.priority = priority;

    if (search) filter.title = { $regex: search, $options: "i" };

    const totalDocuments = await Todo.countDocuments(filter);
    const pages = Math.ceil(totalDocuments / limit);

    const data = await Todo.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: data || [],
      meta: { total: totalDocuments, page, limit, pages },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Get single todo by ID
 * - Return 404 if not found
 */
export async function getTodo(req, res, next) {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }
    return res.status(200).json(todo.toObject());
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Update todo by ID
 * - Use findByIdAndUpdate with { new: true, runValidators: true }
 * - Return 404 if not found
 */
export async function updateTodo(req, res, next) {
  try {
    const id = req.params.id;
    const { title, completed, priority, tags, dueDate } = req.body;
    const newTodo = await Todo.findByIdAndUpdate(
      id,
      {
        title,
        completed,
        priority,
        tags,
        dueDate,
      },
      { new: true, runValidators: true },
    );
    if (!newTodo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }
    return res.status(200).json(newTodo.toObject());
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: { message: error.message } });
    }
    next(error);
  }
}

/**
 * TODO: Toggle completed status
 * - Find todo, flip completed, save
 * - Return 404 if not found
 */
export async function toggleTodo(req, res, next) {
  try {
    const id = req.params.id;
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }
    todo.completed = !todo.completed;
    await todo.save();
    return res.status(200).json(todo.toObject());
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Delete todo by ID
 * - Return 204 (no content) on success
 * - Return 404 if not found
 */
export async function deleteTodo(req, res, next) {
  try {
    const id = req.params.id;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
