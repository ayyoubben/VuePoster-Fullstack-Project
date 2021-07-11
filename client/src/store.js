import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

//import { gql } from 'apollo-boost'
import { defaultClient as apolloClient } from './main'

import { GET_POSTS, SIGNIN_USER } from './queries'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    loading: false
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload
    },
    setLoading: (state, payload) => {
      state.loading = payload
    }
  },
  actions: {
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
    signinUser: ({comit}, payload) => {
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({data}) => {
          console.log(data.signinUser)
        })
        .catch(e => {
          console.log(e)
        })
    }
  },
  getters: {
    posts: state => state.posts,
    loading: state => state.loading
  }
});
