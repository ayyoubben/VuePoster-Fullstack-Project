import { gql } from 'apollo-boost'

// Posts Queries

export const GET_POSTS = gql`
query {
  getPosts {
    _id
    title
    imageUrl
  }
}
`

export const GET_POST = gql`
  query($_id: ID!) {
    getPost(_id: $_id)  {
      _id
      title
      imageUrl
      categories
      description
      likes
      createdDate
      messages{
        _id
        messageBody
        messageDate
        messageUser {
          _id
          username
          avatar
        }
      }
    }
  }
`

//User Queries
export const GET_CURRENT_USER = gql `
  query {
    getCurrentUser{
      _id
      username
      email
      password
      avatar
      joinDate
      favorites {
        _id
        title
        imageUrl
      }    
    }
  }
`

export const INFINITE_SCROLL_POSTS = gql`
  query($pageNum: Int!, $pageSize: Int!) {
    infiniteScrollPosts(pageNum: $pageNum, pageSize: $pageSize) {
      hasMore
      posts {
        _id
        title
        imageUrl
        categories
        description
        likes
        createdDate
        messages{
          _id
        }
        createdBy {
          _id
          username
          avatar
        }
      }
    }
  }
`

//Post Mutations
export const ADD_POST = gql`
  mutation($title: String!, $imageUrl: String!, $categories: [String]!, $description: String!, $creatorId: ID!) {
    addPost(title:$title, imageUrl:$imageUrl, categories:$categories, description:$description, creatorId:$creatorId) {
      _id
      title
      imageUrl
      categories
      description
    }
  }
`

export const ADD_POST_MESSAGE = gql`
  mutation($messageBody: String!, $userId: ID!, $postId: ID!) {
    addPostMessage(messageBody: $messageBody, userId: $userId, postId: $postId) {
      _id
      messageBody
      messageDate
      messageUser {
        _id
        username
        avatar
      }
    }
  }
`

//User Mutations
export const SIGNIN_USER = gql`
  mutation($username: String!, $password: String!) {
    signinUser(username: $username, password: $password) {
      token
    }
  }
`

export const SIGNUP_USER = gql`
  mutation($username: String!, $email: String!, $password: String!) {
  signupUser(username: $username, email: $email, password: $password) {
    token
  }
}
`