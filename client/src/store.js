import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

//import { gql } from 'apollo-boost'
import { defaultClient as apolloClient } from './main'

import { GET_POSTS, SIGNIN_USER, GET_CURRENT_USER, SIGNUP_USER, ADD_POST, GET_POST } from './queries'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
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
          console.log(data.getPost)
          commit('setLoading', false)
        })
        .catch(e => {
          commit('setLoading', false)
          console.log(e)
        })
    },
    addPost: ({commit}, payload) => {
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
          }
        }).then(({data}) => {
          commit('setLoading', false)
          console.log(data.addPost)
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
    user: state => state.user,
    post: state => state.post,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError
  }
});
