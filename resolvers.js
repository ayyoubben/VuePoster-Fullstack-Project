const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const createToken = (user, secret, expiresIn) => {
  const {username, email} = user
  return jwt.sign({username, email}, secret, {expiresIn})
}

module.exports = {
  Query: {
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find({})
        .sort({ createdDate: "desc" })
        .populate({
          path: "createdBy",
          model: "User"
        });
      return posts;
    }
  },
  Mutation: {
    addPost: async (
      _,
      { title, imageUrl, categories, description, creatorId },
      { Post }
    ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save();
      return newPost;
    },
    signinUser: async (_, {username, password}, { User }) => {
      const user = await User.findOne({username})
      if(!user) {
        throw new Error('User not found!')
      }
      const isValidPassword = await bcrypt.compare(password, user.password)
      if(!isValidPassword) {
        throw new Error('Invalid password!')
      }
      return {token: createToken(user, process.env.SECRET, '1hr')}
    },
    signupUser: async (_, { username, email, password }, { User }) => {
      const user = await User.findOne({ username });
      if (user) {
        throw new Error("User already exists");
      }
      const newUser = await new User({
        username,
        email,
        password
      }).save();
      return {token: createToken(newUser, process.env.SECRET, '1hr')}
    }
  }
};