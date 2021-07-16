<template>
  <v-app style="background: #EFEBE9">
    <!--Side Navbar-->
    <v-navigation-drawer app temporary fixed v-model="sideNav">
      <v-toolbar color="accent" dark flat>
        <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
        <router-link to="/" tag="span" style="cursor: pointer">
          <h1 class="title pl-3">VuePoster</h1>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <!--Side navbar links-->
      <v-list>
        <v-list-tile ripple v-for="item in sideNavItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            {{item.title}}
          </v-list-tile-content>
        </v-list-tile>

        <!--Signout Button-->
        <v-list-tile v-if="user" @click="handleSignoutUser">
          <v-list-tile-action>
            <v-icon>logout</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            Sign Out
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!--Horizontal Navbar-->
    <v-toolbar fixed color="primary" dark>
      <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer">
          VuePoster
        </router-link>        
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!--Search Input-->
      <v-text-field flex prepend-icon="search" placeholder="Search Posts" color="accent" single-line hide-details></v-text-field>

      <v-spacer></v-spacer>

      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in horizontalNavItems" :key="item.title" :to="item.link">
            <v-icon class="hidden-sm-only" left>{{item.icon}}</v-icon>
            {{item.title}}
        </v-btn>

        <!--Profile Button-->
        <v-btn flat to="/profile" v-if="user">
          <v-icon class="hidden-sm-only" left>account_box</v-icon>
          <v-badge right color="blue darken-2">
            <!--<span slot="badge"></span>-->
            Profile
          </v-badge>
        </v-btn>
        
        <!--Signout Button-->
        <v-btn flat v-if="user" @click="handleSignoutUser">
          <v-icon class="hidden-sm-only" left>logout</v-icon>
          Signout
        </v-btn>

      </v-toolbar-items>
    </v-toolbar>

    <!--App Content-->
    <main>
      <v-container class="mt-4">
        <transition name="fade">
          <router-view/>
        </transition>

        <!--Auth Snackbar-->
        <v-snackbar v-model="authSnackBar" color="success" :timeout="5000" bottom left>
          <v-icon class="mr-3">check_circle</v-icon>
          <h3>You are now signed in!</h3>
          <v-btn dark flat @click="authSnackBar = false">Close</v-btn>          
        </v-snackbar>

        <!--AuthError Snackbar-->
        <v-snackbar v-if="authError" v-model="authErrorSnackBar" color="warning" :timeout="5000" bottom left>
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{authError.message}}</h3>
          <v-btn dark flat to="/signin">Signin</v-btn>          
        </v-snackbar>

      </v-container>
    </main>
  </v-app>
</template>

<script>
  import {mapGetters, Store} from 'vuex'
  export default {
    name: 'App',
    data() {
      return {
        sideNav: false,
        authSnackBar: false,
        authErrorSnackBar: false
      }
    },
    computed: {
      ...mapGetters(['user', 'authError']),
      horizontalNavItems() {
        let items = [
          {icon: 'mms', title: 'Posts', link:'/posts'},
          {icon: 'login', title: 'Sign In', link: '/signin'},
          {icon: 'add', title: 'Sign Up', link: '/signup'}
        ]
        if (this.user) {
          items = [
            {icon: 'mms', title: 'Posts', link:'/posts'},
          ]
        } 
        return items    
      },
      sideNavItems() {
        let items = [
          {icon: 'mms', title: 'Posts', link:'/posts'},
          {icon: 'login', title: 'Sign In', link: '/signin'},
          {icon: 'add', title: 'Sign Up', link: '/signup'}
        ]
        if (this.user) {
          items = [
            {icon: 'mms', title: 'Posts', link:'/posts'},
            {icon: 'create', title: 'Create Post', link:'/post/add'},
            {icon: 'account_box', title: 'Profile', link:'/profile'}           
          ]
        } 
        return items
      }
    },
    watch: {
      user(newValue, oldValue) {
        //if we had no value for user before, show snackbar
        if (oldValue === null) {
          this.authSnackBar = true
        }
      },
      authError(value) {
        // if auth error is not null show auth error snack bar
        //this.authError = true
        if (value !== null) {  
          this.authErrorSnackBar = true
        }
      }
    },
    methods: {
      handleSignoutUser() {
        this.$store.dispatch("signoutUser")
      },
      toggleSideNav() {
        this.sideNav = !this.sideNav
      }
    }
  }
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active{
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>