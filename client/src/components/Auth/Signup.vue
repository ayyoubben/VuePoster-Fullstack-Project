<template>
    <v-container text-xs-center mt-5 pt-5>
        <!--Signup Title-->
        <v-layout row wrap>
            <v-flex xs12 sm6 offset-sm3>
                <h1>Get Started Here!</h1>

            </v-flex>
        </v-layout>

        <!--Error Alert-->
        <v-layout row wrap v-if="error">
            <v-flex xs12 sm6 offset-sm3>
                <form-alert :message="error.message"></form-alert>
            </v-flex>
        </v-layout>
        <!--Signup Form-->
        <v-layout row wrap>
            <v-flex xs12 sm6 offset-sm3>
                <v-card color="accent" dark>
                     <v-container>
                        <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleSignupUser">


                            <v-layout row>
                              <v-flex xs12>
                                <v-text-field :rules="usernameRules" v-model="username" prepend-icon="face" label="Username" type="text" required></v-text-field>
                              </v-flex>
                            </v-layout>

                            <v-layout row>
                              <v-flex xs12>
                                <v-text-field :rules="emailRules" v-model="email" prepend-icon="email" label="Email" type="email" required></v-text-field>
                              </v-flex>
                            </v-layout>

                            <v-layout row>
                              <v-flex xs12>
                                <v-text-field :rules="passwordRules" v-model="password" prepend-icon="password" label="Password" type="password" required></v-text-field>
                              </v-flex>
                            </v-layout>

                            <v-layout row>
                              <v-flex xs12>
                                <v-text-field :rules="passwordRules" v-model="passwordConfirmation" prepend-icon="gavel" label="Confirm Password" type="password" required></v-text-field>
                              </v-flex>
                            </v-layout>

                            <v-layout row>
                              <v-flex xs12>
                                    <v-btn :loading="loading" :disabled="!isFormValid || loading" color="secondary" type="submit">
                                        <span slot="loader" class="custom-loader">
                                            <v-icon light>cached</v-icon>
                                        </span>
                                        Sign Up
                                    </v-btn>
                                    <h3>
                                        Already have an account?
                                        <router-link to="/signin">Sign In</router-link>
                                    </h3>

                              </v-flex>
                            </v-layout>

                        </v-form>
                      </v-container>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'Signup',
    data() {
        return {
            isFormValid: true,
            username: '',
            email: '',
            password: '',
            passwordConfirmation: '',
            usernameRules: [
                username => !!username || 'Username is required',
                username => username.length < 10 || 'Username must be less than 10 characters'
            ],
            emailRules: [
                email => !!email || 'Email is required',
                email => /.@+./.test(email) || 'Email must be valid'
            ],
            passwordRules: [
                password => !!password || 'Password is required',
                password => password.length >= 7 || 'Password must be at least 7 characters',
                passwordConfirmation => passwordConfirmation === this.password || 'Passwords must match'
            ],
        }
    },
    computed: {
        ...mapGetters(['error', 'loading', 'user'])
    },
    watch: {
        user(value) {
            //if user value changes from null to object, redirect to home page
            if (value) {
                this.$router.push('/')
            }
        }
    },
    methods: {
        handleSignupUser() {
            if (this.$refs.form.validate()) {
                this.$store.dispatch('signupUser', {
                    username: this.username,
                    email: this.email,
                    password: this.password
                })
            }
        }
    }
}
</script>