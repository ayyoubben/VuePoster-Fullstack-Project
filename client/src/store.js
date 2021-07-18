import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

//import { gql } from 'apollo-boost'
import { defaultClient as apolloClient } from './main'

import { GET_POSTS, SIGNIN_USER, GET_CURRENT_USER, SIGNUP_USER, ADD_POST, GET_POST, SEARCH_POSTS, GET_USER_POSTS, UPDATE_USER_POST, DELETE_USER_POST, INFINITE_SCROLL_POSTS } from './queries'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userPosts: [],
    searchResults: [],
    posts: [],
    user: null,
    loading: false,
    authError: null,
    error: null,
    post: null
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload
    },
    setPost: (state, payload) => {
      state.post = payload
    },
    setUserPosts: (state, payload) => {
      if (payload !== null) {
        state.userPosts = payload
      }
    },
    setSearchResults: (state, payload) => {
      if (payload !== null) {
        state.searchResults = payload
      }
    },
    setUser: (state, payload) => {
      state.user = payload
    },
    setLoading: (state, payload) => {
      state.loading = payload
    },
    setError: (state, payload) => {
      state.error = payload
    },
    setAuthError: (state, payload) => {
      state.authError = payload
    },
    clearUser: state => (state.user = null),
    clearSearchResults: state => (state.searchResults = []),
    clearError: state => (state.error = null)
  },
  actions: {
    getCurrentUser: ({ commit }) => {
      commit('setLoading', true)
      apolloClient.query({
        query: GET_CURRENT_USER
      }).then( ({data}) => {
        //console.log(data.getCurrentUser)
        commit('setLoading', false)
        commit('setUser', data.getCurrentUser)
      }).catch(e => {
        commit('setLoading', false)
        console.log(e)
      }) 
    },
    getPosts: ({ commit  }) => {
      // use ApolloClient to fire getPosts query
      commit('setLoading', true)
      apolloClient
        .query({
          query: GET_POSTS
        }).then(({data}) => {
          // Get data from actions to state via mutations
          // commit passes data from actions along to mutations
          commit('setPosts', data.getPosts)
          commit('setLoading', false)
        })
        .catch(e => {
          commit('setLoading', false)
          console.log(e)
        })
    },
    getPost: ({commit}, payload) => {
      // use ApolloClient to fire getPost query
      commit('setLoading', true)
      apolloClient  
        .query({
          query: GET_POST,
          variables: payload
        }).then(({data}) => {
          // Get data from actions to state via mutations
          // commit passes data from actions along to mutations
          commit('setPost', data.getPost)
          //console.log(data.getPost)
          commit('setLoading', false)
        })
        .catch(e => {
          commit('setLoading', false)
          console.log(e)
        })
    },
    getUserPosts: ({commit}, payload) => {
      // use ApolloClient to fire getPosts query
      commit('setLoading', true)
      apolloClient
        .query({
          query: GET_USER_POSTS,
          variables: payload
        }).then(({data}) => {
          // Get data from actions to state via mutations
          // commit passes data from actions along to mutations
          commit('setUserPosts', data.getUserPosts)
          commit('setLoading', false)
        })
        .catch(e => {
          commit('setLoading', false)
          console.log(e)
        })
    },
    searchPosts: ({commit}, payload) => {
      apolloClient
        .query({
          query: SEARCH_POSTS,
          variables: payload
        }).then(({data}) => {
          commit('setSearchResults', data.searchPosts)
        }).catch(e => console.log(e))
    },
    addPost: ({state, commit}, payload) => {
      commit('setLoading', true)
      apolloClient
        .mutate({
          mutation: ADD_POST,
          variables: payload,
          update: (cache, { data : {addPost} }) => {
            // first read the query that we want update
            const data = cache.readQuery({query: GET_POSTS})
            // create updated data
            data.getPosts.unshift(addPost)
            // update data to query
            cache.writeQuery({
              query: GET_POSTS,
              data
            })
          },
          // optimisticResponse ensures data is added immediately as we specified for the update function
          optimisticResponse: {
            __typename: 'Mutation',
            addPost: {
              __typename: 'Post',
              _id: -1,
              ...payload,
            }
          },
          refetchQueries: [
            {
              query: INFINITE_SCROLL_POSTS,
              variables: {
                pageNum: 1,
                pageSize: 2
              }
            },
            {
              query: GET_USER_POSTS,
              variables: {
                userId: state.user._id
              }
            }
          ]
        }).then(({data}) => {
          commit('setLoading', false)
          console.log(data.addPost)
        }).catch(e => {
          console.error(e)
        })
    },
    updateUserPost: ({state, commit}, payload) => {
      apolloClient
        .mutate({
          mutation: UPDATE_USER_POST,
          variables: payload,
        }).then(({data}) => {
          const index = state.userPosts.findIndex(post => post._id === data.updateUserPost._id)
          const userPosts = [
            ...state.userPosts.slice(0, index), 
            data.updateUserPost,
            ...state.userPosts.slice(index + 1)
          ]
          commit('setUserPosts', userPosts)
        }).catch(e => {
          console.error(e)
        })
    },
    deleteUserPost: ({state, commit}, payload) => {
      apolloClient
        .mutate({
          mutation: DELETE_USER_POST,
          variables: payload,
        }).then(({data}) => {
          const index = state.userPosts.findIndex(post => post._id === data.deleteUserPost._id)
          const userPosts = [
            ...state.userPosts.slice(0, index),
            ...state.userPosts.slice(index + 1)
          ]
          commit('setUserPosts', userPosts)
        }).catch(e => {
          console.error(e)
        })
    },
    signinUser: ({commit}, payload) => {
      commit('clearError')
      commit('setLoading', true)
      //clear token from localStorage
      //localStorage.setItem('token', '')
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({data}) => {
          commit('setLoading', false)
          localStorage.setItem('token', data.signinUser.token)
          //console.log(data.signinUser)
          //reload the page
          router.go()
        })
        .catch(e => {
          commit('setLoading', false)
          commit('setError', e)
          console.log(e)
        })
    },
    signupUser: ({commit}, payload) => {
      commit('clearError')
      commit('setLoading', true)
      //clear token from localStorage
      //localStorage.setItem('token', '')
      apolloClient
        .mutate({
          mutation: SIGNUP_USER,
          variables: payload
        })
        .then(({data}) => {
          commit('setLoading', false)
          localStorage.setItem('token', data.signupUser.token)
          //console.log(data.signinUser)
          //reload the page
          router.go()
        })
        .catch(e => {
          commit('setLoading', false)
          commit('setError', e)
          console.log(e)
        })
    },
    signoutUser: ({commit}) => {
      //clear user in state
      commit('clearUser')
      //remove token in localeStorage
      localStorage.setItem('token', '')
      //end session
      apolloClient.resetStore()
      //redirect home
      router.push('/')
    }
  },
  getters: {
    posts: state => state.posts,
    searchResults: state => state.searchResults,
    user: state => state.user,
    userPosts: state => state.userPosts,
    userFavorites: state => state.user && state.user.favorites,
    post: state => state.post,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError
  }
});
