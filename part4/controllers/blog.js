const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const getToken = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs.map((blog) => blog.toJSON()));
});

blogRouter.post('/', async (request, response, next) => {
  const token = getToken(request);

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    const body = request.body;
    if (!body.title || !body.url) {
      response.status(400).end();
    } else {
      const user = await User.findById(decodedToken.id);

      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id,
      });
      const savedBlogs = await blog.save();
      user.blogs = user.blogs.concat(savedBlogs._id);
      await user.save();
      response.status(201).json(savedBlogs.toJSON());
    }
  } catch (err) {
    next(err);
  }
});

blogRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id;
  try {
    await Blog.findByIdAndDelete(id);
    response.status(204).end();
  } catch (err) {
    next(err);
  }
});

blogRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id;

  const entry = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
  };

  try {
    const updatedEntry = await Blog.findByIdAndUpdate(id, entry, {
      new: true,
    });

    if (updatedEntry) {
      response.json(updatedEntry.toJSON());
    } else {
      response.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = blogRouter;
