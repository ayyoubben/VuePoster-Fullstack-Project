import "@babel/polyfill";
import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'

import FormAlert from './components/Shared/FormAlert'

// Register global component
Vue.component('form-alert', FormAlert)

Vue.use(VueApollo)

//Setup ApolloClient
export const defaultClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  // include auth token with requests node to back-end
  fetchOptions: {
    credentials: 'include'
  },
  request: operation => {
    //check token
    if (!localStorage.token) {
      localStorage.setItem('token', '')
    }

    // operation adds the token to an auth header, which sent to backe-end
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },
  onError: ({graphQLErrors, networkError}) => {
    if (networkError) {
      console.log('[networkError]', networkError)
    }

    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err)
        if (err.name === 'AuthenticationError') {
          // set auth error in state to show snackbar
          store.commit('setAuthError', err)
          // sign out user to clear token
          store.dispatch('signoutUser')
        }
      }
    }
  }
})

const apolloProvider = new VueApollo({ defaultClient })

Vue.config.productionTip = false;

new Vue({
  apolloProvider,
  router,
  store,
  render: h => h(App),
  created() {
    // execute getCurrentUser query
    this.$store.dispatch("getCurrentUser")
  }
}).$mount("#app");
